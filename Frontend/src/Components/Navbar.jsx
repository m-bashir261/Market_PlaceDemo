import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, MapPin, Sun, Moon, Store, Bell, Heart, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Check if the token exists to determine auth status
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        let isDark;
        
        if (savedTheme) {
            isDark = savedTheme === 'dark';
        } else {
            isDark = document.documentElement.classList.contains('dark') || 
                (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !document.documentElement.classList.contains('light'));
        }
        
        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        }
    }, []);

    const toggleDarkMode = () => {
        const newValue = !isDarkMode;
        setIsDarkMode(newValue);
        if (newValue) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Handle search
        console.log("Searching for:", searchQuery);
    };

    // --- New Logout Handler ---
    const handleLogout = () => {
        // 1. Remove the token from local storage
        localStorage.removeItem('token');
        
        // 2. Update auth state
        setIsAuthenticated(false);
        
        // 3. Close mobile menu if it's open
        setIsMobileMenuOpen(false);
        
        // 4. Navigate to the home page
        navigate('/home'); 
    };

    return (
        <>
            <div className="promo-banner">
                <div className="promo-content">
                    <span className="promo-icon">🚚</span>
                    <span>FREE delivery on orders $500+ • 📍 Now delivering in 10-20 minutes • 💎 Premium member exclusive deals</span>
                    <span className="promo-icon">✨</span>
                </div>
            </div>

            <header className="navbar glass-card">
                <div className="navbar-container">
                    <div className="navbar-logo-section">
                        <Link to="/home" className="navbar-logo-link">
                            <div className="logo-icon">
                                <span>L</span>
                                <div className="pulse-dot"></div>
                            </div>
                            <div className="logo-text">
                                <h1>Kemet</h1>
                                <p>Shop Local, Live Better</p>
                            </div>
                        </Link>
                    </div>

                    <div className="navbar-location hide-on-mobile">
                        <div className="location-box">
                            <MapPin size={16} className="location-icon" />
                            <div>
                                <p className="location-label">Deliver to</p>
                                <button className="location-btn text-truncate">Select location</button>
                            </div>
                        </div>
                    </div>

                    <div className="navbar-search hide-on-mobile md-up">
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="Search for products, brands, categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <Search size={20} className="search-icon-left" />
                            <button type="submit" className="search-btn modern-btn">Search</button>
                        </form>
                    </div>

                    <div className="navbar-actions hide-on-mobile md-up">
                        <button className="action-btn" title="Seller Dashboard">
                            <Store size={20} className="action-icon" />
                            <span>Sell</span>
                        </button>

                        <button className="action-btn" onClick={toggleDarkMode} title="Toggle Theme">
                            {isDarkMode ? <Sun size={20} className="action-icon theme-icon" /> : <Moon size={20} className="action-icon theme-icon" />}
                        </button>

                        <button className="action-btn icon-only relative" title="Notifications">
                            <Bell size={20} className="action-icon" />
                            <span className="badge badge-red">3</span>
                        </button>

                        <button className="action-btn icon-only relative" title="Wishlist">
                            <Heart size={20} className="action-icon" />
                            <span className="badge badge-pink">7</span>
                        </button>

                        <button className="action-btn icon-only relative" title="Cart" onClick={() => navigate('/products')}>
                            <ShoppingCart size={20} className="action-icon" />
                            <span className="badge badge-orange animate-bounce">2</span>
                        </button>

                        {/* Conditional Rendering for Desktop Auth Button */}
                        {isAuthenticated ? (
                            <button className="sign-in-btn modern-btn" onClick={handleLogout}>
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <button className="sign-in-btn modern-btn" onClick={() => navigate('/login')}>
                                <User size={16} />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <div className="location-box mb-3">
                            <MapPin size={16} className="location-icon" />
                            <div>
                                <p className="location-label">Deliver to</p>
                                <button className="location-btn text-truncate">Select location</button>
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="mobile-search-form mb-3">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <Search size={20} className="search-icon-left" />
                        </form>

                        <div className="mobile-grid">
                            <button className="grid-action-btn">
                                <Store size={20} />
                                <span>Sell</span>
                            </button>
                            <button className="grid-action-btn" onClick={toggleDarkMode}>
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                <span>Theme</span>
                            </button>
                            <button className="grid-action-btn relative">
                                <ShoppingCart size={20} />
                                <span className="badge badge-orange badge-mobile">2</span>
                                <span>Cart</span>
                            </button>
                        </div>

                        <div className="mobile-auth mt-3 border-t pt-3">
                            {/* Conditional Rendering for Mobile Auth Button */}
                            {isAuthenticated ? (
                                <button className="sign-in-btn modern-btn full-width" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <button className="sign-in-btn modern-btn full-width" onClick={() => {
                                    navigate('/login');
                                    setIsMobileMenuOpen(false); // Clean up: close menu when navigating
                                }}>
                                    <User size={16} />
                                    <span>Sign In</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Navbar;