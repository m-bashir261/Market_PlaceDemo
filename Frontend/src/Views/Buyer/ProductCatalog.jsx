import React, { useState, useEffect } from 'react';
import './ProductCatalog.css';
import ProductCard from './ProductCard';
import { PackageSearch, Filter, SlidersHorizontal, Star } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/products';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { seller: sellerParam } = useParams();
  
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = location.state?.category || 'ALL';

  const [filters, setFilters] = useState({
    category: initialCategory,
    priceRange: 'ALL',
    minRating: 0,
    search: initialSearch,
    seller: sellerParam || 'ALL',
    inStock: false
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
  if (sellerParam) {
    // If a seller is in the URL, update filter to that seller
    if (sellerParam !== filters.seller) {
      setFilters(prev => ({ ...prev, seller: sellerParam }));
      setPage(1);
    }
  } else {
    // CRITICAL: If no seller is in URL, reset the seller filter to 'ALL'
    if (filters.seller !== 'ALL') {
      setFilters(prev => ({ ...prev, seller: 'ALL' }));
      setPage(1);
    }
  }
}, [sellerParam]);

  useEffect(() => {
    const searchParam = new URLSearchParams(location.search).get('search') || '';
    if (searchParam !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchParam }));
      setPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
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

  // Synchronize category name to ID if it came from Home page state
  useEffect(() => {
    if (categories.length > 0 && filters.category !== 'ALL') {
      const isId = /^[0-9a-fA-F]{24}$/.test(filters.category);
      if (!isId) {
        const found = categories.find(c => c.name.toLowerCase() === filters.category.toLowerCase());
        if (found) {
          setFilters(prev => ({ ...prev, category: found._id }));
        }
      }
    }
  }, [categories, filters.category]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts({
          page,
          category: filters.category,
          limit: 12,
          priceRange: filters.priceRange,
          minRating: filters.minRating,
          search: filters.search,
          seller: filters.seller,
          inStock: filters.inStock
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
  }, [filters.category, filters.priceRange, filters.minRating, filters.search, filters.seller, page]);

  useEffect(() => {
    if (sellerParam && sellerParam !== filters.seller) {
      setFilters(prev => ({ ...prev, seller: sellerParam }));
      setPage(1);
    }
  }, [sellerParam]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const isSellerShop = filters.seller && filters.seller !== 'ALL';
  const sellerShopName = isSellerShop ? decodeURIComponent(filters.seller) : null;

  return (
      <div className="catalog-page-container">
        <Navbar />
        <div className="catalog-container">
          <header className="catalog-header">
            <div className="header-title">
              <h1>{isSellerShop ? `${sellerShopName}'s Shop` : 'Product Catalog'}</h1>
              <p>{isSellerShop ? `View all products offered by ${sellerShopName}.` : 'Discover our premium selection of high quality items'}</p>
            </div>
          </header>
        {isSellerShop && (
          <section className="seller-shop-banner">
            <button className="modern-btn" type="button" onClick={() => navigate('/products')}>View all products</button>
          </section>
        )}
          <div className="search-bar-container">
            <input 
              type="text" 
              placeholder="Search listings by name or description..." 
              className="search-input"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
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
                            checked={filters.category === cat._id}
                            onChange={() => handleFilterChange('category', cat._id)}
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

              <div className="filter-group">
                <h3>Availability</h3>
                <label className="checkbox-label">
                  <input 
                      type="checkbox" 
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  />
                  <span className="custom-checkbox"></span>
                  <span className="label-text">Only show in stock</span>
                </label>
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
                      onClick={() => setFilters({category: 'ALL', priceRange: 'ALL', minRating: 0, search: '', seller: 'ALL', inStock: false})}
                  >
                    Clear Filters
                  </button>
                </div>
            ) : (
                <div className="products-grid">
                  {products.map(product => (
                      <ProductCard key={product._id} listing={product} searchQuery={filters.search} />
                  ))}
                </div>
            )}
          </main>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default ProductCatalog;
