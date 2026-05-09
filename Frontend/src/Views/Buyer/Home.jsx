import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Zap, Shield, Award, Store, Users, Truck, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import ProductCard from './ProductCard';
import { getProducts, getCategories } from '../../services/products';
import { Link } from 'react-router-dom';
import './Home.css';
import './ProductCatalog.css';

const features = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: '10-20 min delivery from nearby shops',
        iconClass: 'icon-yellow',
        boxClass: 'box-yellow'
    },
    {
        icon: MapPin,
        title: 'Local First',
        description: 'Support neighborhood businesses',
        iconClass: 'icon-blue',
        boxClass: 'box-blue'
    },
    {
        icon: Shield,
        title: 'Secure & Safe',
        description: 'Protected payments & quality assured',
        iconClass: 'icon-green',
        boxClass: 'box-green'
    },
    {
        icon: Award,
        title: 'Premium Quality',
        description: 'Curated products from trusted sellers',
        iconClass: 'icon-purple',
        boxClass: 'box-purple'
    }
];

const stats = [
    { icon: Store, value: '10K+', label: 'Local Shops' },
    { icon: Users, value: '500K+', label: 'Happy Customers' },
    { icon: Truck, value: '15 min', label: 'Avg Delivery' },
    { icon: TrendingUp, value: '99.2%', label: 'Success Rate' }
];

const STATIC_CATEGORIES = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Groceries', icon: '🥬' },
    { name: 'Beauty', icon: '✨' },
    { name: 'Home & Garden', icon: '🏠' },
    { name: 'Sports', icon: '⚽' }
];

const CATEGORY_ICONS = {
    'Electronics': '📱',
    'Fashion': '👕',
    'Groceries': '🥬',
    'Beauty': '✨',
    'Home & Garden': '🏠',
    'Sports': '⚽',
    'Default': '📦'
};

const Home = () => {
    const navigate = useNavigate();
    const [topProducts, setTopProducts] = useState([]);
    const [categories, setCategories] = useState(STATIC_CATEGORIES);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCats, setLoadingCats] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch products and categories in parallel
                const [productData, catData] = await Promise.all([
                    getProducts({ limit: 20 }),
                    getCategories()
                ]);

                if (Array.isArray(productData)) {
                    const sorted = [...productData]
                        .filter(p => (p.rating || 0) > 0)
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .slice(0, 6);
                    setTopProducts(sorted);
                }

                if (Array.isArray(catData)) {
                    // Merge static categories with backend data to prevent them from disappearing
                    const merged = [...STATIC_CATEGORIES];
                    catData.forEach(backendCat => {
                        const existingIdx = merged.findIndex(c => c.name.toLowerCase() === backendCat.name.toLowerCase());
                        if (existingIdx !== -1) {
                            // Update existing static entry with backend details (like _id)
                            merged[existingIdx] = { ...merged[existingIdx], ...backendCat };
                        } else {
                            // Add new category from backend if not in static list
                            merged.push(backendCat);
                        }
                    });
                    setCategories(merged);
                }
            } catch (err) {
                console.error("Failed to load home page data", err);
            } finally {
                setLoadingProducts(false);
                setLoadingCats(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="home-page-container">
            <Navbar />

            <main className="home-main max-w-7xl">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-bg">
                        <div className="hero-floating shape-1"></div>
                        <div className="hero-floating shape-2"></div>
                        <div className="hero-floating shape-3"></div>
                    </div>

                    <div className="hero-content">
                        <div className="hero-text-col">
                            <div className="hero-badge">
                                <MapPin size={14} className="mr-2" />
                                <span>📍 Set your location for best experience</span>
                            </div>

                            <h1 className="hero-title">
                                Shop Smart.<br />
                                <span className="hero-gradient-text">Live Local.</span>
                            </h1>

                            <p className="hero-desc">
                                Discover amazing products from local shops with lightning-fast delivery.
                                Compare prices, support local businesses, and get everything you need in minutes.
                            </p>

                            <div className="hero-actions">
                                <button
                                    className="hero-btn primary"
                                    onClick={() => navigate('/products')}
                                >
                                    Explore Products
                                    <ArrowRight size={20} className="ml-2" />
                                </button>

                                <Link to="/signup">
                                  <button className="hero-btn secondary">
                                    Join as Seller
                                 </button>
                                </Link>
                            </div>

                            <div className="hero-stats">
                                {stats.map((stat, i) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={i} className="stat-item">
                                            <div className="stat-icon-wrapper"><Icon size={24} /></div>
                                            <div className="stat-value">{stat.value}</div>
                                            <div className="stat-label">{stat.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="hero-visual-col">
                            <div className="hero-grid-2">
                                <div className="grid-col left-col">
                                    <div className="glass-card hero-product-card card-1">
                                        <img src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop" alt="Phone" />
                                        <h4>iPhone 15 Pro</h4>
                                        <p>$1,199</p>
                                    </div>
                                    <div className="glass-card hero-product-card card-2">
                                        <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop" alt="Jacket" />
                                        <h4>Designer Jacket</h4>
                                        <p>$299</p>
                                    </div>
                                </div>
                                <div className="grid-col right-col mt-4">
                                    <div className="glass-card hero-product-card card-3">
                                        <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop" alt="Sofa" />
                                        <h4>Modern Sofa</h4>
                                        <p>$1,299</p>
                                    </div>
                                    <div className="glass-card hero-product-card card-4">
                                        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop" alt="Shoes" />
                                        <h4>Running Shoes</h4>
                                        <p>$159</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <div className="section-header center">
                        <h2>Why Choose Kemet?</h2>
                        <p>Experience the future of local shopping with premium features designed for modern consumers.</p>
                    </div>

                    <div className="features-grid">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className={`glass-card feature-card ${f.boxClass}`}>
                                    <div className={`feature-icon ${f.iconClass}`}>
                                        <Icon size={32} />
                                    </div>
                                    <h3>{f.title}</h3>
                                    <p>{f.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Categories Section */}
                <section className="categories-section">
                    <div className="section-header between">
                        <div>
                            <h2>Shop by Category</h2>
                            <p>Explore our comprehensive range of products</p>
                        </div>
                        <button className="modern-btn secondary" onClick={() => navigate('/products')}>
                            View All <ArrowRight size={16} className="ml-2" />
                        </button>
                    </div>

                    <div className="categories-grid">
                        {categories.length > 0 ? (
                            categories.map((cat, i) => (
                                <div key={i} className="glass-card category-card" onClick={() => navigate('/products', { state: { category: cat.name } })}>
                                    <div className="cat-icon">{cat.icon || CATEGORY_ICONS[cat.name] || CATEGORY_ICONS['Default']}</div>
                                    <h4>{cat.name}</h4>
                                </div>
                            ))
                        ) : loadingCats ? (
                            [1,2,3,4,5,6].map(i => (
                                <div key={i} className="glass-card category-card skeleton" style={{height: '100px'}}></div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--pc-text-muted)', gridColumn: '1/-1', textAlign: 'center' }}>No categories available.</p>
                        )}
                    </div>
                </section>

                {/* Product Preview Section */}
                <section className="products-preview-section">
                    <div className="section-header between">
                        <div>
                            <h2>Top Rated Products</h2>
                            <p>Discover our highest rated finds selected for you</p>
                        </div>
                        <button className="modern-btn secondary" onClick={() => navigate('/products')}>
                            View All <ArrowRight size={16} className="ml-2" />
                        </button>
                    </div>

                    <div className="products-grid">
                        {loadingProducts ? (
                            [1,2,3,4,5,6].map(i => (
                                <div key={i} className="product-card skeleton" style={{height: '400px'}}></div>
                            ))
                        ) : topProducts.length > 0 ? (
                            topProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <p style={{ color: 'var(--pc-text-muted)' }}>No products available at the moment.</p>
                        )}
                    </div>
                </section>


            </main>

            <Footer />
        </div>
    );
};

export default Home;
