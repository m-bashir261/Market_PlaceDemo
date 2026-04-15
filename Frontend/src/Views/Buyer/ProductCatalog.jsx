import React, { useState, useEffect } from 'react';
import './ProductCatalog.css';
import ProductCard from './ProductCard';
import { PackageSearch, Filter, SlidersHorizontal, Star } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
// Assuming fetchProducts is default properly exported and fetchCategories is named export
// Let's modify the imports to match api.js correctly. api.js exports fetchProducts as default
// but does not export fetchCategories as named if it was not written like `export { fetchCategories }`
// Actually, let's fix api.js next to make sure.

import fetchProducts from '../../services/api';
// We will manually fetch categories until we are sure api.js exports it.
// Wait, I will use api.js export format.

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: 'ALL',
    priceRange: 'ALL',
    minRating: 0
  });

  const [localPrice, setLocalPrice] = useState([0, 2000]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const [min, max] = localPrice;
      if (min === 0 && max === 2000) {
        if (filters.priceRange !== 'ALL') handleFilterChange('priceRange', 'ALL');
      } else {
        const rangeStr = `${min}-${max}`;
        if (filters.priceRange !== rangeStr) handleFilterChange('priceRange', rangeStr);
      }
    }, 500); // Debounce slider movement before querying the db
    return () => clearTimeout(timeout);
  }, [localPrice, filters.priceRange]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products/categories");
        const cats = await response.json();
        if (Array.isArray(cats)) {
          setCategories(cats);
        } else {
          console.error("Categories returned non-array:", cats);
          setCategories([]);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({
          page,
          category: filters.category,
          limit: 12,
          priceRange: filters.priceRange,
          minRating: filters.minRating
        });

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("API returned a non-array response:", data);
          setProducts([]); // Fallback
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
      <div className="catalog-container">
        <header className="catalog-header">
          <div className="header-title">
            <h1>Product Catalog</h1>
            <p>Discover our premium selection of high quality items</p>
          </div>
        </header>

        <div className="catalog-content">
          <aside className="filters-sidebar">
            <div className="filter-group">
              <h3>
                <Filter size={18} /> Filters
              </h3>
            </div>

            <div className="filter-group">
              <h3>Category</h3>
              <div className="filter-options">
                <label className="checkbox-label">
                  <input
                      type="radio"
                      name="category"
                      checked={filters.category === 'ALL'}
                      onChange={() => handleFilterChange('category', 'ALL')}
                  />
                  <span className="custom-checkbox"></span>
                  <span className="label-text">All Categories</span>
                </label>
                {categories.map(cat => (
                    <label key={cat._id} className="checkbox-label">
                      <input
                          type="radio"
                          name="category"
                          checked={filters.category === cat.name}
                          onChange={() => handleFilterChange('category', cat.name)}
                      />
                      <span className="custom-checkbox"></span>
                      <span className="label-text">{cat.name}</span>
                    </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Price Range</h3>
              <div style={{ padding: '10px 10px 20px 10px' }}>
                <Slider
                    range
                    min={0}
                    max={2000}
                    step={10}
                    value={localPrice}
                    onChange={(val) => setLocalPrice(val)}
                    trackStyle={[{ backgroundColor: 'var(--pc-primary)', height: 6 }]}
                    handleStyle={[
                      { borderColor: 'var(--pc-primary)', backgroundColor: 'white', opacity: 1, height: 20, width: 20, marginTop: -7 },
                      { borderColor: 'var(--pc-primary)', backgroundColor: 'white', opacity: 1, height: 20, width: 20, marginTop: -7 }
                    ]}
                    railStyle={{ backgroundColor: 'var(--pc-border)', height: 6 }}
                />
              </div>
              <div className="price-display-box">
                <span>${localPrice[0]}</span>
                <span>${localPrice[1]}</span>
              </div>
            </div>

            <div className="filter-group">
              <h3>Minimum Rating</h3>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={24}
                        className={filters.minRating >= star ? "star filled" : "star"}
                        onClick={() => handleFilterChange('minRating', filters.minRating === star ? 0 : star)}
                    />
                ))}
              </div>
              {filters.minRating > 0 && <span style={{fontSize: '0.8rem', color: 'var(--pc-text-muted)', marginTop: '8px', display: 'block'}}>{filters.minRating} Stars & Up (<span style={{textDecoration:'underline', cursor:'pointer'}} onClick={() => handleFilterChange('minRating', 0)}>Clear</span>)</span>}
            </div>
          </aside>

          <main className="products-wrapper">
            {loading ? (
                <div className="products-grid">
                  {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="product-card skeleton" style={{height: '400px'}}></div>
                  ))}
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--pc-text-muted)' }}>
                  <PackageSearch size={64} style={{ opacity: 0.3, marginBottom: '20px' }} />
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--pc-text)' }}>No products found</h2>
                  <p>We couldn't find any products matching your current filters.</p>
                  <button
                      className="modern-btn"
                      style={{ margin: '20px auto' }}
                      onClick={() => setFilters({category: 'ALL', priceRange: 'ALL', minRating: 0})}
                  >
                    Clear Filters
                  </button>
                </div>
            ) : (
                <div className="products-grid">
                  {products.map(product => (
                      <ProductCard key={product._id} product={product} />
                  ))}
                </div>
            )}
          </main>
        </div>
      </div>
  );
};

export default ProductCatalog;
