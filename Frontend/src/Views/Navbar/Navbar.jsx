import React from 'react';
import { Link } from 'react-router-dom'; // if you use React Router
import './Navbar.css';

const Navbar = ({ role = 'buyer' , name = '' }) => {
const navItems = role === 'seller'
? [
    { label: 'Dashboard', href: '/seller/dashboard' },
    { label: 'Listings', href: '/seller/listings' },
    { label: 'Incoming Orders', href: '/seller/orders' },
    ]
: [
    { label: 'Browse', href: '/buyer/browse' },
    { label: 'My Orders', href: '/buyer/orders' },
    { label: 'Cart', href: '/buyer/cart' },
    { label: 'Wishlist', href: '/buyer/wishlist' }
    ];

return (
<nav className="navbar">
    {/* Left side: logo + seller badge (only for sellers) */}
    <div className="nav-left">
    {/* <a href="/" className="logo-link">Marketplace</a> */}
    {role === 'seller' && (
        <div className="seller-badge">
            <span className="badge-icon">👤</span>
            <span className="seller-label">Welcome, {name}!</span>
        </div>
    )}
    </div>

    {/* Center navigation links */}
    <div className="nav-links">
    {navItems.map((item, idx) => (
        <a key={idx} href={item.href} className="nav-link">
        {item.label}
        </a>
    ))}
    </div>

    {/* Right side: seller info + logout, and Create Listing button */}
    <div className="nav-right">
    {role === 'seller' && (
        <>
        <Link to="/seller/listings/create" className="create-listing-btn">
            Create New Listing
        </Link>
        </>
    )}
    <button className="logout-btn" onClick={() => {/* handle logout */}}>
        Logout
    </button>
    </div>
</nav>
);
};

export default Navbar;