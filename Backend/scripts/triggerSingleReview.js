const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const AIReview = require('../models/AIReview');
const { aiSummaryQueue, JOB_NAMES } = require('../queues/aiSummaryQueue');

// Load environment variables from ../.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const LISTING_ID = '69fe547110322a0ccad88535';

async function triggerReview() {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB ✅');

        console.log(`Manually triggering AI review for listing ID: ${LISTING_ID}`);

        // 1. Reset the AIReview record to force the worker to skip the delta guard
        // and set status to pending.
        await AIReview.findOneAndUpdate(
            { listing_id: LISTING_ID },
            { 
                $set: { 
                    status: 'pending', 
                    review_count_at_generation: 0 
                } 
            },
            { upsert: true, new: true }
        );
        console.log(`Updated AIReview record status to 'pending' and reset review count.`);

        // 2. Add job to BullMQ
        const jobId = `manual-trigger-${LISTING_ID}-${Date.now()}`;
        await aiSummaryQueue.add(
            JOB_NAMES.SUMMARIZE,
            { listing_id: LISTING_ID },
            { jobId }
        );
        console.log(`Job added to queue with ID: ${jobId} 🚀`);

        console.log('Success! The worker should pick up this job shortly.');
    } catch (error) {
        console.error('❌ Error triggering review:', error.message);
    } finally {
        // Close connections
        await mongoose.disconnect();
        // BullMQ queue needs to be closed to exit the process
        await aiSummaryQueue.close();
        process.exit(0);
    }
}

triggerReview();
