import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext();
const API = `${process.env.REACT_APP_API_URL}/api/wishlist`;

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // Load just the IDs on mount (lightweight)
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API}/ids`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { ids: [] })
      .then(data => setWishlistIds(new Set(data.ids || [])))
      .catch(() => {});
  }, []);

  const isWishlisted = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

  const toggleWishlist = useCallback(async (productId) => {
    const token = getToken();
    if (!token) return false; // signal: not logged in

    const alreadyIn = wishlistIds.has(productId);

    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev);
      alreadyIn ? next.delete(productId) : next.add(productId);
      return next;
    });

    try {
      const res = await fetch(`${API}/${productId}`, {
        method: alreadyIn ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      setWishlistIds(new Set(data.wishlistIds || []));
      return true;
    } catch {
      // Rollback on error
      setWishlistIds(prev => {
        const next = new Set(prev);
        alreadyIn ? next.add(productId) : next.delete(productId);
        return next;
      });
      return false;
    }
  }, [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
