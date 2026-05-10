/**
 * useAISummary.js
 *
 * Custom hook to fetch the AI summary for a given listing.
 * Handles loading, error, polling (for pending status), and caching.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL;
const POLL_INTERVAL_MS = 5000; // poll every 5s while status is pending/processing

export function useAISummary(listingId) {
    const [data, setData]       = useState(null);   // the full API response
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const pollRef               = useRef(null);

    const clearPoll = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const fetchSummary = useCallback(async () => {
        if (!listingId) return;
        try {
            const res = await fetch(`${BASE_URL}/api/ai-summary/${listingId}`);

            // 404 = no job has run yet (< first review scenario)
            if (res.status === 404) {
                setData({ status: 'not_found' });
                setLoading(false);
                clearPoll();
                return;
            }

            if (!res.ok) throw new Error(`Server error ${res.status}`);

            const json = await res.json();
            setData(json);
            setLoading(false);
            setError(null);

            // Stop polling once the job reaches a terminal state
            if (json.status === 'completed' || json.status === 'failed') {
                clearPoll();
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
            clearPoll();
        }
    }, [listingId]);

    useEffect(() => {
        if (!listingId) return;

        setLoading(true);
        setData(null);
        setError(null);
        clearPoll();

        fetchSummary().then(() => {
            // After first fetch, if still pending/processing → start polling
            // We check via a small timeout so `data` state has settled
            const checkAndPoll = setTimeout(() => {
                setData(prev => {
                    if (prev?.status === 'pending' || prev?.status === 'processing') {
                        pollRef.current = setInterval(fetchSummary, POLL_INTERVAL_MS);
                    }
                    return prev;
                });
            }, 100);
            return () => clearTimeout(checkAndPoll);
        });

        return clearPoll;
    }, [listingId, fetchSummary]);

    return { data, loading, error };
}
