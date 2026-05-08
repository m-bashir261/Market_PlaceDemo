/**
 * AIReviewSummary.jsx
 *
 * Glassmorphism AI-generated summary card.
 * Sits at the top of the reviews section on ProductDetail.
 *
 * States handled:
 *  - loading      → shimmer skeleton
 *  - pending/processing → animated "generating" state
 *  - completed    → full glassmorphism card with rating badge
 *  - not_found    → silent (returns null — no UI clutter)
 *  - failed       → minimal soft error chip
 *  - error (network) → minimal soft error chip
 */

import React, { useMemo } from 'react';
import { useAISummary } from '../hooks/useAISummary';
import './AIReviewSummary.css';

// ─── Sub-component: Pros / Cons List ─────────────────────────────────────────

function ProConsList({ pros = [], cons = [] }) {
    if (pros.length === 0 && cons.length === 0) return null;
    return (
        <div className="ai-procons-row">
            {pros.length > 0 && (
                <div className="ai-procons-section ai-procons-section--pros">
                    <div className="ai-procons-heading">
                        <span className="ai-procons-icon" aria-hidden="true">✓</span>
                        Pros
                    </div>
                    <ul className="ai-procons-list">
                        {pros.map((p, i) => (
                            <li key={i} className="ai-procons-item ai-procons-item--pro">{p}</li>
                        ))}
                    </ul>
                </div>
            )}
            {cons.length > 0 && (
                <div className="ai-procons-section ai-procons-section--cons">
                    <div className="ai-procons-heading">
                        <span className="ai-procons-icon" aria-hidden="true">✕</span>
                        Cons
                    </div>
                    <ul className="ai-procons-list">
                        {cons.map((c, i) => (
                            <li key={i} className="ai-procons-item ai-procons-item--con">{c}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function StarIcon({ filled, half }) {
    return (
        <svg
            className={`ai-star ${filled ? 'ai-star--filled' : ''} ${half ? 'ai-star--half' : ''}`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {half ? (
                <>
                    {/* Half-filled star using clipPath */}
                    <defs>
                        <clipPath id="half-clip">
                            <rect x="0" y="0" width="12" height="24" />
                        </clipPath>
                    </defs>
                    <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="currentColor"
                        clipPath="url(#half-clip)"
                    />
                    <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </>
            ) : (
                <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={filled ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            )}
        </svg>
    );
}

// ─── Sub-component: AI Rating Badge ──────────────────────────────────────────

function AIRatingBadge({ rating }) {
    // Compute full, half, and empty stars from a float rating
    const stars = useMemo(() => {
        const full  = Math.floor(rating);
        const half  = rating - full >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return { full, half, empty };
    }, [rating]);

    return (
        <div className="ai-rating-badge" aria-label={`AI rating: ${rating} out of 5`}>
            <div className="ai-rating-score">
                <span className="ai-rating-number">{rating.toFixed(1)}</span>
                <span className="ai-rating-max">/5</span>
            </div>
            <div className="ai-rating-stars" role="img" aria-label={`${rating} stars`}>
                {Array.from({ length: stars.full  }).map((_, i) => <StarIcon key={`f${i}`} filled />)}
                {stars.half === 1 && <StarIcon half />}
                {Array.from({ length: stars.empty }).map((_, i) => <StarIcon key={`e${i}`} />)}
            </div>
            <span className="ai-rating-label">AI Score</span>
        </div>
    );
}

// ─── Sub-component: Skeleton Loader ──────────────────────────────────────────

function AISummarySkeleton() {
    return (
        <div className="ai-summary-card ai-summary-card--skeleton" aria-busy="true" aria-label="Loading AI summary">
            <div className="ai-summary-header">
                <div className="ai-skeleton ai-skeleton--label" />
            </div>
            <div className="ai-summary-body">
                <div className="ai-skeleton ai-skeleton--badge" />
                <div className="ai-skeleton-text-block">
                    <div className="ai-skeleton ai-skeleton--line" style={{ width: '95%' }} />
                    <div className="ai-skeleton ai-skeleton--line" style={{ width: '88%' }} />
                    <div className="ai-skeleton ai-skeleton--line" style={{ width: '92%' }} />
                    <div className="ai-skeleton ai-skeleton--line" style={{ width: '70%' }} />
                </div>
            </div>
        </div>
    );
}

// ─── Sub-component: Generating State ─────────────────────────────────────────

function AIGeneratingState() {
    return (
        <div className="ai-summary-card ai-summary-card--generating" role="status">
            <div className="ai-generating-inner">
                <div className="ai-generating-orb">
                    <div className="ai-orb-ring" />
                    <div className="ai-orb-ring ai-orb-ring--2" />
                    <span className="ai-orb-icon">✦</span>
                </div>
                <div className="ai-generating-text">
                    <p className="ai-generating-title">AI is analyzing reviews…</p>
                    <p className="ai-generating-sub">This may take a moment. The summary will appear automatically.</p>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function AIReviewSummary({ listingId }) {
    const { data, loading, error } = useAISummary(listingId);

    // ── Loading (first fetch) ────────────────────────────────────────────────
    if (loading) return <AISummarySkeleton />;

    // ── Network error ────────────────────────────────────────────────────────
    if (error) return null; // fail silently for network errors

    // ── No summary generated yet (product has no reviews and no job) ─────────
    if (!data || data.status === 'not_found') return null;

    // ── Background job in progress ───────────────────────────────────────────
    if (data.status === 'pending' || data.status === 'processing') {
        return <AIGeneratingState />;
    }

    // ── Job failed ───────────────────────────────────────────────────────────
    if (data.status === 'failed') {
        return (
            <div className="ai-summary-card ai-summary-card--error" role="alert">
                <span className="ai-error-icon">⚡</span>
                <span className="ai-error-text">AI summary temporarily unavailable.</span>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────
    const isDescriptionMode = data.analysis_type === 'description';
    const updatedDate = data.last_updated
        ? new Date(data.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    return (
        <div className="ai-summary-card" role="region" aria-label="AI-generated review summary">
            {/* Animated glow border */}
            <div className="ai-glow-border" aria-hidden="true" />

            {/* Header row */}
            <div className="ai-summary-header">
                <div className="ai-summary-label">
                    <span className="ai-sparkle" aria-hidden="true">✦</span>
                    <span className="ai-label-text">AI-Generated Summary</span>
                    {isDescriptionMode && (
                        <span className="ai-mode-chip">Product Overview</span>
                    )}
                </div>
                {updatedDate && (
                    <span className="ai-updated-date">Updated {updatedDate}</span>
                )}
            </div>

            {/* Body: badge + summary text */}
            <div className="ai-summary-body">
                <AIRatingBadge rating={data.ai_rating} />

                <div className="ai-summary-content">
                    <p className="ai-summary-text">{data.summary}</p>

                    {/* Pros / Cons */}
                    <ProConsList pros={data.pros} cons={data.cons} />

                    {/* Metadata footer */}
                    <div className="ai-summary-meta">
                        {!isDescriptionMode && data.reviews_analyzed > 0 && (
                            <span className="ai-meta-chip">
                                <svg viewBox="0 0 16 16" aria-hidden="true" className="ai-meta-icon">
                                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 1 1 0 1.5A.75.75 0 0 1 8 4zm1 7.5H7v-4h2v4z" fill="currentColor"/>
                                </svg>
                                Analyzed {data.reviews_analyzed} review{data.reviews_analyzed !== 1 ? 's' : ''}
                            </span>
                        )}
                        {isDescriptionMode && (
                            <span className="ai-meta-chip ai-meta-chip--desc">
                                Based on product description
                            </span>
                        )}
                        <span className="ai-meta-chip ai-meta-chip--model">
                            <svg viewBox="0 0 16 16" aria-hidden="true" className="ai-meta-icon">
                                <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
                                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                            Llama 3.2
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIReviewSummary;
