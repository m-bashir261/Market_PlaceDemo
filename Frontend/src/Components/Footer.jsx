import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer-container glass-card">
            <div className="footer-content max-w-7xl">
                <div className="footer-grid">
                    <div className="footer-brand-col">
                        <div className="footer-logo">
                            <div className="footer-logo-icon">
                                <span>L</span>
                            </div>
                            <h3>Kemet</h3>
                        </div>
                        <p className="footer-desc">
                            Your neighborhood shopping platform. Shop local, support businesses, get fast delivery.
                        </p>
                        <div className="footer-badges">
                            <span>🤩 Made in Egypt</span>
                            <span>•</span>
                            <span>💚 Local Businesses</span>
                        </div>
                    </div>

                    <div className="footer-link-col">
                        <h4>For Customers</h4>
                        <ul>
                            <li><Link to="/app">Download App</Link></li>
                            <li><Link to="/orders">Track Order</Link></li>
                            <li><Link to="/help">Help Center</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    <div className="footer-link-col">
                        <h4>For Sellers</h4>
                        <ul>
                            <li><Link to="/seller/listings/create">Become a Seller</Link></li>
                            <li><Link to="/seller/orders">Seller Dashboard</Link></li>
                            <li><Link to="/pricing">Pricing Plans</Link></li>
                            <li><Link to="/support">Seller Support</Link></li>
                        </ul>
                    </div>

                    <div className="footer-link-col">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><Link to="/press">Press</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {(new Date()).getFullYear()} Kemet. All rights reserved. Made with ❤️ for local communities.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
