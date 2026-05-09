const mongoose = require('mongoose');

/**
 * AIReview Schema
 *
 * One document per listing, updated in-place.
 * Tracks which summarization condition was used, how many reviews were
 * analyzed, the AI-generated summary text, and the AI-calculated rating.
 * The `status` field prevents duplicate concurrent jobs from writing
 * conflicting data, and `review_count_at_generation` enables the delta
 * check (re-run every AI_UPDATE_DELTA new reviews).
 */
const aiReviewSchema = new mongoose.Schema(
    {
        listing_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true,
            unique: true,   // one document per product, updated in-place
            index: true,
        },

        // Which condition generated this summary
        analysis_type: {
            type: String,
            enum: ['description', 'reviews'],
            required: true,
        },

        // The AI-produced narrative text
        summary: {
            type: String,
            required: true,
            trim: true,
        },

        // AI-identified key strengths (array of short strings)
        pros: {
            type: [String],
            default: [],
        },

        // AI-identified key weaknesses / caveats (array of short strings)
        cons: {
            type: [String],
            default: [],
        },
        // AI-calculated fair rating: float 1.0 – 5.0
        ai_rating: {
            type: Number,
            required: true,
            min: 1.0,
            max: 5.0,
        },

        // --- Metadata for redundancy prevention ---

        // Total review count at the moment of generation.
        // Used to compute the delta: if (currentCount - review_count_at_generation) >= delta → re-run.
        review_count_at_generation: {
            type: Number,
            required: true,
            default: 0,
        },

        // How many reviews were actually passed to the LLM
        // (may be less than total due to smart sampling)
        reviews_analyzed: {
            type: Number,
            required: true,
            default: 0,
        },

        // Job lifecycle status to prevent duplicate processing
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
            index: true,
        },

        // Stored so frontend can surface the error reason if needed
        error_message: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'last_updated' },
    }
);

module.exports = mongoose.model('AIReview', aiReviewSchema);