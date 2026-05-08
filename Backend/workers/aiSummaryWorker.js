/**
 * aiSummaryWorker.js
 *
 * BullMQ worker that processes AI summarization jobs.
 * Implements the three-condition logic and the smart sampling algorithm
 * for products with more than 100 reviews.
 *
 * Job payload: { listing_id: string }
 */

const { Worker }    = require('bullmq');
const AIReview      = require('../models/AIReview');
const Review        = require('../models/Review');
const Listing       = require('../models/Listing');
const { summarizeFromDescription, summarizeFromReviews } = require('../services/llmService');
const { redisConnection, JOB_NAMES } = require('../queues/aiSummaryQueue');

// ─── Configuration ────────────────────────────────────────────────────────────

const REVIEW_THRESHOLD_LOW  = 10;                   // Condition A: < 10 reviews
const REVIEW_THRESHOLD_HIGH = 100;                  // Condition C: > 100 reviews
const MAX_SAMPLES     = parseInt(process.env.AI_MAX_SAMPLES     || '80',   10);
const TOKEN_CHAR_LIMIT = parseInt(process.env.AI_TOKEN_CHAR_LIMIT || '6000', 10);
const UPDATE_DELTA    = parseInt(process.env.AI_UPDATE_DELTA    || '10',   10);

// ─── Smart Sampling Algorithm ─────────────────────────────────────────────────

/**
 * Proportionally samples reviews by star rating, prioritizing recency.
 *
 * Algorithm:
 * 1. Group reviews into 5 buckets by rating (1–5 stars).
 * 2. Compute each bucket's proportional quota out of MAX_SAMPLES.
 * 3. Within each bucket, take the most recent reviews first.
 * 4. Flatten, shuffle, then truncate to TOKEN_CHAR_LIMIT characters total.
 *
 * @param {Array} reviews  — Mongoose documents sorted by createdAt DESC
 * @returns {Array<{rating: number, comment: string}>}
 */
function smartSample(reviews) {
    const total = reviews.length;

    // Step 1: Group by star rating
    const buckets = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (const r of reviews) {
        const star = Math.round(r.rating);
        if (buckets[star]) buckets[star].push(r);
    }

    // Step 2: Proportional quota per bucket
    const sampled = [];
    for (let star = 1; star <= 5; star++) {
        const bucket = buckets[star];
        if (bucket.length === 0) continue;

        // Proportional share, minimum 1 if the bucket is non-empty
        const quota = Math.max(1, Math.round((bucket.length / total) * MAX_SAMPLES));

        // Step 3: Bucket is already sorted newest-first from the DB query
        sampled.push(...bucket.slice(0, quota));
    }

    // Step 4: Shuffle to prevent rating-order bias in the LLM context window
    for (let i = sampled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sampled[i], sampled[j]] = [sampled[j], sampled[i]];
    }

    // Step 5: Truncate to token-safe character budget
    let charCount = 0;
    const tokenSafe = [];
    for (const r of sampled) {
        const entry = `Rating: ${r.rating}/5 — "${r.comment}"`;
        if (charCount + entry.length > TOKEN_CHAR_LIMIT) break;
        tokenSafe.push({ rating: r.rating, comment: r.comment });
        charCount += entry.length;
    }

    return tokenSafe;
}

// ─── Job Processor ────────────────────────────────────────────────────────────

/**
 * Core job handler. Called by BullMQ for each dequeued job.
 * @param {import('bullmq').Job} job
 */
async function processSummarizationJob(job) {
    const { listing_id } = job.data;
    console.log(`[AI Worker] Processing job ${job.id} for listing ${listing_id}`);

    // ── Guard: check if summarization is already in progress ──────────────────
    const existing = await AIReview.findOne({ listing_id });
    if (existing && existing.status === 'processing') {
        console.log(`[AI Worker] Job ${job.id} skipped — already processing`);
        return { skipped: true, reason: 'already_processing' };
    }

    // ── Mark as processing to prevent concurrent duplicates ───────────────────
    const doc = await AIReview.findOneAndUpdate(
        { listing_id },
        {
            $set: {
                listing_id,
                status: 'processing',
                error_message: null,
            },
        },
        { upsert: true, new: true }
    );

    try {
        // ── Fetch review count ─────────────────────────────────────────────────
        const reviewCount = await Review.countDocuments({ listing_id });

        // ── Delta check: skip if not enough new reviews since last generation ──
        if (
            existing &&
            existing.status === 'completed' &&
            (reviewCount - existing.review_count_at_generation) < UPDATE_DELTA &&
            reviewCount >= REVIEW_THRESHOLD_LOW  // always re-run on first threshold cross
        ) {
            console.log(`[AI Worker] Job ${job.id} skipped — delta not reached (${reviewCount - existing.review_count_at_generation} new reviews)`);
            await AIReview.findOneAndUpdate({ listing_id }, { $set: { status: 'completed' } });
            return { skipped: true, reason: 'delta_not_reached' };
        }

        let llmResult;
        let analysisType;
        let reviewsAnalyzed;

        // ═══════════════════════════════════════════════════════════════════════
        // CONDITION A: Fewer than REVIEW_THRESHOLD_LOW reviews
        //   → Prompt LLM with the product description only.
        // ═══════════════════════════════════════════════════════════════════════
        if (reviewCount < REVIEW_THRESHOLD_LOW) {
            console.log(`[AI Worker] Condition A — using product description (${reviewCount} reviews)`);

            const listing = await Listing.findById(listing_id).select('title description').lean();
            if (!listing) throw new Error(`Listing ${listing_id} not found`);

            llmResult       = await summarizeFromDescription(listing);
            analysisType    = 'description';
            reviewsAnalyzed = 0;

        // ═══════════════════════════════════════════════════════════════════════
        // CONDITION B: 10 to 100 reviews
        //   → Pass ALL reviews to the LLM.
        // ═══════════════════════════════════════════════════════════════════════
        } else if (reviewCount <= REVIEW_THRESHOLD_HIGH) {
            console.log(`[AI Worker] Condition B — full review pass (${reviewCount} reviews)`);

            const reviews = await Review.find({ listing_id })
                .select('rating comment createdAt')
                .sort({ createdAt: -1 })
                .lean();

            // Trim to token-safe limit even in Condition B (edge: 100 long reviews)
            let charCount = 0;
            const safeReviews = [];
            for (const r of reviews) {
                const entry = `Rating: ${r.rating}/5 — "${r.comment}"`;
                if (charCount + entry.length > TOKEN_CHAR_LIMIT) break;
                safeReviews.push({ rating: r.rating, comment: r.comment });
                charCount += entry.length;
            }

            llmResult       = await summarizeFromReviews(safeReviews);
            analysisType    = 'reviews';
            reviewsAnalyzed = safeReviews.length;

        // ═══════════════════════════════════════════════════════════════════════
        // CONDITION C: More than 100 reviews
        //   → Smart sampling: proportional by star rating, recency-prioritized.
        // ═══════════════════════════════════════════════════════════════════════
        } else {
            console.log(`[AI Worker] Condition C — smart sampling (${reviewCount} reviews)`);

            const allReviews = await Review.find({ listing_id })
                .select('rating comment createdAt')
                .sort({ createdAt: -1 })  // newest first — sampler preserves this priority
                .lean();

            const sampledReviews = smartSample(allReviews);
            console.log(`[AI Worker] Smart sampler selected ${sampledReviews.length} / ${reviewCount} reviews`);

            llmResult       = await summarizeFromReviews(sampledReviews);
            analysisType    = 'reviews';
            reviewsAnalyzed = sampledReviews.length;
        }

        // ── Persist result ─────────────────────────────────────────────────────
        await AIReview.findOneAndUpdate(
            { listing_id },
            {
                $set: {
                    analysis_type: analysisType,
                    summary: llmResult.summary,
                    ai_rating: llmResult.ai_rating,
                    review_count_at_generation: reviewCount,
                    reviews_analyzed: reviewsAnalyzed,
                    status: 'completed',
                    error_message: null,
                },
            },
            { upsert: true }
        );

        console.log(`[AI Worker] Job ${job.id} completed — ai_rating: ${llmResult.ai_rating}`);
        return { success: true, ai_rating: llmResult.ai_rating, analysisType };

    } catch (error) {
        // ── Mark as failed with error message for observability ────────────────
        console.error(`[AI Worker] Job ${job.id} failed:`, error.message);
        await AIReview.findOneAndUpdate(
            { listing_id },
            {
                $set: {
                    status: 'failed',
                    error_message: error.message,
                },
            }
        );
        throw error;  // BullMQ will apply the retry policy
    }
}

// ─── Worker Initialization ────────────────────────────────────────────────────

/**
 * Creates and returns the BullMQ worker.
 * Call this once at application startup (in server.js).
 * @returns {import('bullmq').Worker}
 */
function startAISummaryWorker() {
    const worker = new Worker('ai-summary', processSummarizationJob, {
        connection: redisConnection,
        concurrency: 2,     // process up to 2 summarization jobs simultaneously
    });

    worker.on('completed', (job, result) => {
        if (!result?.skipped) {
            console.log(`[AI Worker] ✅ Job ${job.id} done`);
        }
    });

    worker.on('failed', (job, err) => {
        console.error(`[AI Worker] ❌ Job ${job?.id} failed after all retries: ${err.message}`);
    });

    console.log('[AI Worker] 🤖 AI Summary Worker started');
    return worker;
}

module.exports = { startAISummaryWorker, smartSample };
