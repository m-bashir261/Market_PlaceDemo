/**
 * llmService.js
 *
 * Wraps the Ollama HTTP API to call Llama 3.2 (3B).
 * Handles strict JSON enforcement, prompt templating,
 * and response parsing with a regex fallback.
 *
 * Ollama must be running locally:
 *   ollama serve
 *   ollama pull llama3.2
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    || 'llama3.2';
const TIMEOUT_MS      = parseInt(process.env.OLLAMA_TIMEOUT_MS || '90000', 10);

// ─── System Prompt ────────────────────────────────────────────────────────────
// Strict JSON-only enforcement. The model must not output any prose outside
// the JSON object. The regex fallback handles cases where it adds preamble.

const SYSTEM_PROMPT = `You are an expert product analyst AI. Your only job is to analyze the provided text and return a structured JSON response.

RULES — follow these without exception:
1. Respond with ONLY a raw JSON object. No markdown, no code fences, no explanatory text before or after the JSON.
2. The JSON object must have exactly four keys: "summary", "ai_rating", "pros", and "cons".
3. "summary" must be a string: a concise, well-written, unbiased paragraph (3–5 sentences maximum).
4. "ai_rating" must be a floating-point number between 1.0 and 5.0, rounded to one decimal place.
5. "pros" must be an array of 2–5 short strings, each describing a distinct positive aspect of the product.
6. "cons" must be an array of 1–4 short strings, each describing a distinct negative aspect or limitation. If no negatives are evident, use an array with a single honest caveat.
7. Do not include any other keys, comments, or trailing commas.

Example of a valid response:
{"summary": "This product is highly regarded for its durability and ease of use. Customers frequently praise the fast shipping and responsive seller support. A small number of users reported sizing inconsistencies, but overall satisfaction is high.","ai_rating": 4.3,"pros": ["Durable build quality", "Fast shipping", "Responsive seller support"],"cons": ["Sizing inconsistencies reported by some users"]}`;

// ─── Prompt Templates ─────────────────────────────────────────────────────────

/**
 * Condition A: Fewer than 10 reviews — summarize the product description.
 */
function buildDescriptionPrompt(listing) {
    return `You are analyzing a product listing. No customer reviews exist yet.

PRODUCT TITLE: ${listing.title}

PRODUCT DESCRIPTION:
${listing.description}

Based solely on the product title and description above:
- Write a helpful, informative "summary" explaining what this product is and its potential use cases for a buyer.
- Assign an "ai_rating" that reflects the listing quality and appeal based on the description (not actual reviews). Be conservative: use a range of 3.0–4.0 for an unknown product.
- List 2–5 "pros": notable positive features or selling points evident from the description.
- List 1–4 "cons": potential drawbacks or limitations a buyer should be aware of. If nothing negative is stated, include one honest uncertainty (e.g., "No customer reviews yet to validate claims").

Return ONLY the JSON object.`;
}

/**
 * Conditions B & C: 10+ reviews — summarize the review text.
 * @param {Array<{rating: number, comment: string}>} reviews
 */
function buildReviewsPrompt(reviews) {
    const reviewBlock = reviews
        .map((r, i) => `[Review ${i + 1}] Rating: ${r.rating}/5\n"${r.comment}"`)
        .join('\n\n');

    return `You are analyzing customer reviews for a product sold on a marketplace.

CUSTOMER REVIEWS (${reviews.length} total):
${reviewBlock}

Based on the reviews above:
- Write an unbiased "summary" that captures the overall sentiment, highlights the most praised aspects, and notes any recurring complaints.
- Calculate a fair "ai_rating" that reflects the true sentiment of the reviews (not a simple arithmetic average — weigh recency and intensity of sentiment).
- List 2–5 "pros": the most frequently praised or standout positive aspects across reviewers.
- List 1–4 "cons": the most commonly mentioned complaints or recurring negatives. If reviews are overwhelmingly positive, include the most minor criticism mentioned.

Return ONLY the JSON object.`;
}

// ─── Core LLM Call ────────────────────────────────────────────────────────────

/**
 * Calls the Ollama /api/generate endpoint and returns parsed JSON.
 * @param {string} userPrompt
 * @returns {Promise<{summary: string, ai_rating: number}>}
 */
async function callLLM(userPrompt) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let rawText = '';
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                system: SYSTEM_PROMPT,
                prompt: userPrompt,
                stream: false,
                format: 'json',     // Ollama native JSON mode — constrains sampling
                options: {
                    temperature: 0.3,   // low temp = consistent, structured output
                    top_p: 0.9,
                    num_predict: 512,   // summary rarely needs more than 512 tokens
                },
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Ollama API error ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        rawText = data.response || '';
    } finally {
        clearTimeout(timer);
    }

    return parseAndValidateLLMResponse(rawText);
}

/**
 * Extracts and validates the JSON object from the LLM's raw text output.
 * Uses a regex fallback to handle model preamble or markdown wrapping.
 * @param {string} raw
 * @returns {{summary: string, ai_rating: number, pros: string[], cons: string[]}}
 */
function parseAndValidateLLMResponse(raw) {
    let parsed;

    // Primary: direct JSON parse
    try {
        parsed = JSON.parse(raw.trim());
    } catch (_) {
        // Fallback: extract the first complete {...} block in the response
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
            throw new Error(`LLM returned non-JSON output: ${raw.slice(0, 200)}`);
        }
        try {
            parsed = JSON.parse(match[0]);
        } catch (e) {
            throw new Error(`LLM JSON parse failed after extraction: ${e.message}`);
        }
    }

    // Validate required fields
    if (typeof parsed.summary !== 'string' || parsed.summary.trim().length === 0) {
        throw new Error('LLM response missing valid "summary" field.');
    }
    if (typeof parsed.ai_rating !== 'number') {
        // Some models stringify floats — coerce
        parsed.ai_rating = parseFloat(parsed.ai_rating);
        if (isNaN(parsed.ai_rating)) {
            throw new Error('LLM response missing valid "ai_rating" field.');
        }
    }

    // Clamp ai_rating to [1.0, 5.0] and round to 1 decimal
    parsed.ai_rating = Math.round(Math.min(5.0, Math.max(1.0, parsed.ai_rating)) * 10) / 10;

    // Validate and normalise pros/cons — graceful fallback if model omits them
    const normList = (val) => {
        if (Array.isArray(val)) return val.filter(s => typeof s === 'string' && s.trim()).map(s => s.trim());
        if (typeof val === 'string' && val.trim()) return [val.trim()];
        return [];
    };

    return {
        summary:   parsed.summary.trim(),
        ai_rating: parsed.ai_rating,
        pros:      normList(parsed.pros),
        cons:      normList(parsed.cons),
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a summary from a product description (Condition A).
 * @param {{ title: string, description: string }} listing
 */
async function summarizeFromDescription(listing) {
    const prompt = buildDescriptionPrompt(listing);
    return callLLM(prompt);
}

/**
 * Generate a summary from customer reviews (Conditions B & C).
 * @param {Array<{rating: number, comment: string}>} reviews
 */
async function summarizeFromReviews(reviews) {
    const prompt = buildReviewsPrompt(reviews);
    return callLLM(prompt);
}

module.exports = { summarizeFromDescription, summarizeFromReviews };
