/**
 * aiSummaryController.js
 *
 * Handles GET /api/ai-summary/:listingId
 *
 * Caching strategy:
 *   In-memory Map with a TTL of AI_CACHE_TTL_MS (default: 5 minutes).
 *   Completed summaries are cached; pending/failed are not, to allow
 *   the client to poll until the job completes without stale data.
 *
 *   For a production environment, swap the in-memory Map for Redis
 *   (which BullMQ already depends on) to make the cache cluster-safe.
 */

const AIReview = require('../models/AIReview');
const { aiSummaryQueue, JOB_NAMES } = require('../queues/aiSummaryQueue');

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

const CACHE_TTL_MS = parseInt(process.env.AI_CACHE_TTL_MS || String(5 * 60 * 1000), 10);

const summaryCache = new Map(); // listingId → { data, expiresAt }

function getCached(listingId) {
    const entry = summaryCache.get(listingId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        summaryCache.delete(listingId);
        return null;
    }
    return entry.data;
}

function setCache(listingId, data) {
    summaryCache.set(listingId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * GET /api/ai-summary/:listingId
 *
 * Response shape:
 *   200 + { status: 'completed', summary, ai_rating, analysis_type, ... }
 *   200 + { status: 'pending' | 'processing', message }
 *   200 + { status: 'failed', message }
 *   404 — no summary record found and no job enqueued yet
 */
const getAISummary = async (req, res) => {
    try {
        const { listingId } = req.params;

        // 1. Cache hit — skip DB entirely
        const cached = getCached(listingId);
        if (cached) {
            return res.status(200).json({ ...cached, cached: true });
        }

        // 2. DB lookup
        const aiReview = await AIReview.findOne({ listing_id: listingId })
            .select('-__v')
            .lean();

        // 3. No record at all — the worker hasn't run yet for this listing
        if (!aiReview) {
            return res.status(404).json({
                message: 'No AI summary available for this product yet.',
                status: 'not_found',
            });
        }

        // 4. Job is still in progress — return 200 so frontend can poll
        if (aiReview.status === 'pending' || aiReview.status === 'processing') {
            return res.status(200).json({
                status: aiReview.status,
                message: 'AI summary is being generated. Please check back shortly.',
            });
        }

        // 5. Job failed
        if (aiReview.status === 'failed') {
            return res.status(200).json({
                status: 'failed',
                message: 'AI summary generation encountered an error.',
                error_message: aiReview.error_message,
            });
        }

        // 6. Completed — build response and cache it
        const responseData = {
            status: 'completed',
            listing_id:    aiReview.listing_id,
            summary:       aiReview.summary,
            pros:          aiReview.pros || [],
            cons:          aiReview.cons || [],
            ai_rating:     aiReview.ai_rating,
            analysis_type: aiReview.analysis_type,
            reviews_analyzed:          aiReview.reviews_analyzed,
            review_count_at_generation: aiReview.review_count_at_generation,
            last_updated:  aiReview.last_updated,
            cached: false,
        };

        setCache(listingId, responseData);
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('[aiSummaryController] getAISummary error:', error.message);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * POST /api/ai-summary/:listingId/trigger  (admin/debug endpoint)
 *
 * Manually enqueues a re-summarization job, bypassing the delta check.
 * Useful for admin dashboards or testing.
 */
const triggerAISummary = async (req, res) => {
    try {
        const { listingId } = req.params;

        // Invalidate cache on manual trigger
        summaryCache.delete(listingId);

        // Reset the review_count_at_generation to 0 to force the worker
        // to skip the delta guard
        await AIReview.findOneAndUpdate(
            { listing_id: listingId },
            { $set: { status: 'pending', review_count_at_generation: 0 } },
            { upsert: true }
        );

        // Unique jobId prevents queue flooding — BullMQ deduplicates
        await aiSummaryQueue.add(
            JOB_NAMES.SUMMARIZE,
            { listing_id: listingId },
            { jobId: `force-${listingId}-${Date.now()}` }
        );

        return res.status(202).json({ message: 'AI summary job enqueued.', listing_id: listingId });
    } catch (error) {
        console.error('[aiSummaryController] triggerAISummary error:', error.message);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { getAISummary, triggerAISummary };
