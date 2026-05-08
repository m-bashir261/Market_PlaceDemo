const { Queue } = require('bullmq');

/**
 * Redis connection configuration.
 * BullMQ uses ioredis under the hood.
 */
const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

/**
 * The AI Summary queue.
 *
 * All summarization jobs flow through here.
 * Workers pick jobs up asynchronously, keeping review submission fast.
 */
const aiSummaryQueue = new Queue('ai-summary', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,                // retry up to 3 times on transient LLM errors
        backoff: {
            type: 'exponential',
            delay: 5000,            // 5s → 10s → 20s
        },
        removeOnComplete: { count: 100 },   // keep last 100 completed jobs for inspection
        removeOnFail: { count: 50 },
    },
});

// Named job type constant — avoids magic strings across the codebase
const JOB_NAMES = {
    SUMMARIZE: 'summarize',
};

module.exports = { aiSummaryQueue, redisConnection, JOB_NAMES };
