import React from 'react';
import { Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { toast } from 'react-toastify';
import './ProductCard.css';

const defaultImg = "https://i.ibb.co/000000/default-image.jpg";

// Highlight matching text in search results
const getHighlightedText = (text, highlight) => {
  if (!highlight?.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="search-highlight">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
};

const ProductCard = ({ listing, product, searchQuery = "" }) => {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const item = listing || product;
  if (!item) return null;

  const productId = item._id || item.id;
  const wishlisted = isWishlisted(productId);

  const handleWishlistClick = async (e) => {
    e.stopPropagation(); // prevent card navigation
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please sign in to save items to your wishlist');
      return;
    }
    const ok = await toggleWishlist(productId);
    if (ok) {
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } else {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="product-card" onClick={() => navigate(`/buyer/product/${productId}`)}>
      <div className="image-container">
        <span className="category-tag">{item.category_name}</span>
        <span className="rating-tag">
          <Star size={14} fill="currentColor" /> {Number(item.rating || 0).toFixed(1)}
        </span>
        <img src={item.image_url || defaultImg} alt={item.title} className="product-img" />

        {/* ── Wishlist Heart Button ── */}
        <button
          className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
          onClick={handleWishlistClick}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            size={16}
            fill={wishlisted ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        </button>

        <button className="quick-view-btn">Quick View</button>
      </div>

      <div className="product-info">
        <h3 className="product-name">{getHighlightedText(item.title, searchQuery)}</h3>
        <p className="product-desc">{getHighlightedText(item.description, searchQuery)}</p>
        <div className="product-footer">
          <div className="price-wrap">
            <span className="price">{item.price ? item.price.toFixed(2) : '0.00'}</span>
            <span className="currency"> LE</span>
          </div>
          {item.countInStock > 0
            ? <span className="stock-status in-stock">{item.countInStock} in stock</span>
            : <span className="stock-status out-of-stock">Out of stock</span>
          }
        </div>
      </div>
    </div>
  );
};

export default ProductCard;