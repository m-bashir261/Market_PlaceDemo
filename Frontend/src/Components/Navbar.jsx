import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, MapPin, Sun, Moon, Store, Bell, Heart, LogOut } from 'lucide-react';
import { Search, ShoppingCart, User, Menu, X, MapPin, Sun, Moon, Store, Bell, Heart, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    

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

    const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp < Date.now() / 1000;
        } catch (e) {
            return true;
        }
    };

    const handleProfileClick = () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token) {
            toast.error("Unauthorized: Please sign in first.", { position: "top-right" });
            navigate('/login');
            return;
        }

        if (isTokenExpired(token)) {
            toast.warning("Session Expired: Please sign in again.", { position: "top-right" });
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
            return;
        }

        if (role !== 'buyer') {
            toast.error("Access Denied: Log in again.", { position: "top-right" });
            // Optional: stay on page or navigate to seller dashboard if they are a seller
            // But the user said "never open seller dashboard", so we just show alert.
            return;
        }

        // If all checks pass, go to buyer orders
        navigate('/orders');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const isLoggedIn = !!localStorage.getItem('token');

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
                        <button className="action-btn" title="Seller Dashboard" onClick={() => navigate('/signup')}>
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

                        <button className="action-btn icon-only relative" title="Cart" onClick={() => navigate('/checkout')}>
                            <ShoppingCart size={20} className="action-icon" />
                            {cartCount > 0 && <span className="badge badge-orange animate-bounce">{cartCount}</span>}
                        </button>

                        {isLoggedIn ? (
                            <>
                                <button className="action-btn icon-only relative" onClick={handleProfileClick} title="Profile">
                                    <div className="avatar">
                                        <User size={16} />
                                    </div>
                                </button>
                                <button className="action-btn icon-only relative" onClick={handleLogout} title="Log Out">
                                    <LogOut size={20} className="action-icon" style={{color: '#ef4444'}} />
                                </button>
                            </>
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
                            <button className="grid-action-btn" onClick={() => navigate('/signup')}>
                                <Store size={20} />
                                <span>Sell</span>
                            </button>
                            <button className="grid-action-btn" onClick={toggleDarkMode}>
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                <span>Theme</span>
                            </button>
                            <button className="grid-action-btn relative" onClick={() => navigate('/checkout')}>
                                <ShoppingCart size={20} />
                                {cartCount > 0 && <span className="badge badge-orange badge-mobile">{cartCount}</span>}
                                <span>Cart</span>
                            </button>
                        </div>

                        <div className="mobile-auth mt-3 border-t pt-3">
                            {isLoggedIn ? (
                                <>
                                    <button className="sign-in-btn modern-btn full-width mb-3" onClick={handleProfileClick}>
                                        <User size={16} />
                                        <span>Profile / Orders</span>
                                    </button>
                                    <button className="action-btn full-width" onClick={handleLogout} style={{ justifyContent: 'center', color: '#ef4444' }}>
                                        <LogOut size={16} />
                                        <span>Log Out</span>
                                    </button>
                                </>
                            ) : (
                                <button className="sign-in-btn modern-btn full-width" onClick={() => navigate('/login')}>
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