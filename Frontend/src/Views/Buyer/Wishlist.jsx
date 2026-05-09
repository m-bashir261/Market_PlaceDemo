import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, PackageSearch } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import './Wishlist.css';

const API = 'http://localhost:5000/api/wishlist';

export default function Wishlist() {
  const navigate = useNavigate();
  const { toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch full listing objects
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setItems(data.listings || []))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleRemove = async (productId) => {
    // Optimistic
    setItems(prev => prev.filter(i => i._id !== productId));
    const ok = await toggleWishlist(productId);
    if (!ok) {
      toast.error('Failed to remove from wishlist');
      // Re-fetch to restore
    } else {
      toast.success('Removed from wishlist');
    }
  };

  const handleAddToCart = (item) => {
    addToCart({
      listing_id: item._id,
      title:      item.title,
      price:      item.price,
      image_url:  item.image_url,
      quantity:   1,
      seller_id:  item.seller_id,
    });
    toast.success(`${item.title} added to cart 🛒`);
  };

  return (
    <div className="wishlist-page">
      <Navbar />
      <main className="wishlist-main">
        {/* ── Header ── */}
        <div className="wishlist-header">
          <div className="wishlist-header-left">
            <Heart size={28} className="wishlist-header-icon" fill="currentColor" />
            <div>
              <h1>My Wishlist</h1>
              <p>{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          {items.length > 0 && (
            <button className="wl-clear-btn" onClick={async () => {
              for (const item of items) await toggleWishlist(item._id);
              setItems([]);
              toast.success('Wishlist cleared');
            }}>
              Clear All
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="wl-grid">
            {[1,2,3,4].map(i => <div key={i} className="wl-card skeleton" style={{ height: 340 }} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="wl-empty">
            <PackageSearch size={72} className="wl-empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Browse our catalog and save items you love</p>
            <button className="wl-browse-btn" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="wl-grid">
            {items.map(item => (
              <div key={item._id} className="wl-card">
                {/* Image */}
                <div
                  className="wl-card-image"
                  onClick={() => navigate(`/buyer/product/${item._id}`)}
                >
                  <img
                    src={item.image_url || 'https://i.ibb.co/000000/default-image.jpg'}
                    alt={item.title}
                  />
                  <span className="wl-category-tag">{item.category_name}</span>
                </div>

                {/* Info */}
                <div className="wl-card-body">
                  <h3
                    className="wl-title"
                    onClick={() => navigate(`/buyer/product/${item._id}`)}
                  >
                    {item.title}
                  </h3>
                  <p className="wl-desc">{item.description}</p>

                  <div className="wl-footer">
                    <span className="wl-price">${item.price?.toFixed(2)}</span>
                    <div className="wl-actions">
                      <button
                        className="wl-cart-btn"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.countInStock}
                        title={item.countInStock ? 'Add to cart' : 'Out of stock'}
                      >
                        <ShoppingCart size={16} />
                        {item.countInStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                      <button
                        className="wl-remove-btn"
                        onClick={() => handleRemove(item._id)}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
