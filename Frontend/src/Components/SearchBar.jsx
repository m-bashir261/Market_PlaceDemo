import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Tag, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const API = 'http://localhost:5000/api/search';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({ className = '' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 280);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ products: [], categories: [] });
      setOpen(false);
      return;
    }

    setLoading(true);
    fetch(`${API}?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then(r => r.ok ? r.json() : { products: [], categories: [] })
      .then(data => {
        setResults(data);
        setOpen(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const hasResults = results.products.length > 0 || results.categories.length > 0;

  const handleSelect = (item, type) => {
    setOpen(false);
    setQuery('');
    if (type === 'product') {
      navigate(`/buyer/product/${item.id}`);
    } else {
      navigate('/products', { state: { category: item.name } });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  const clearQuery = () => {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  // Render highlighted HTML safely (Meilisearch wraps matches in <mark>)
  const renderHighlight = (text) => (
    <span dangerouslySetInnerHTML={{ __html: text || '' }} />
  );

  return (
    <div className={`sb-container ${className}`} ref={containerRef}>
      <form className="sb-form" onSubmit={handleSubmit}>
        <Search size={18} className="sb-icon-left" />
        <input
          ref={inputRef}
          type="text"
          className="sb-input"
          placeholder="Search products, categories…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className="sb-spinner" />}
        {!loading && query && (
          <button type="button" className="sb-clear" onClick={clearQuery}>
            <X size={15} />
          </button>
        )}
        <button type="submit" className="sb-submit">Search</button>
      </form>

      {/* ── Dropdown ── */}
      {open && (
        <div className="sb-dropdown">
          {/* Categories section */}
          {results.categories.length > 0 && (
            <div className="sb-section">
              <span className="sb-section-label">
                <Tag size={12} /> Categories
              </span>
              {results.categories.map(cat => (
                <button
                  key={cat.id}
                  className="sb-item sb-item-category"
                  onClick={() => handleSelect(cat, 'category')}
                >
                  <span className="sb-item-icon"><Tag size={14} /></span>
                  <span className="sb-item-text">
                    {renderHighlight(cat._formatted?.name || cat.name)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Products section */}
          {results.products.length > 0 && (
            <div className="sb-section">
              <span className="sb-section-label">
                <Package size={12} /> Products
              </span>
              {results.products.map(p => (
                <button
                  key={p.id}
                  className="sb-item sb-item-product"
                  onClick={() => handleSelect(p, 'product')}
                >
                  {p.image_url && (
                    <img src={p.image_url} alt="" className="sb-item-thumb" />
                  )}
                  <div className="sb-item-body">
                    <span className="sb-item-title">
                      {renderHighlight(p._formatted?.title || p.title)}
                    </span>
                    <span className="sb-item-meta">
                      {p.category_name} · ${Number(p.price).toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!hasResults && !loading && debouncedQuery && (
            <div className="sb-empty">
              No results for "<strong>{debouncedQuery}</strong>"
            </div>
          )}

          {/* View all link */}
          {hasResults && (
            <button
              className="sb-view-all"
              onClick={() => handleSubmit({ preventDefault: () => {} })}
            >
              View all results for "{debouncedQuery}" →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
