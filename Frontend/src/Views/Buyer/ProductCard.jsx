import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const defaultImg = "https://i.ibb.co/000000/default-image.jpg";

// 1. Create the highlighting helper function
const getHighlightedText = (text, highlight) => {
  if (!highlight?.trim()) {
    return <span>{text}</span>;
  }

  // Escape special characters and split text by the search term (case-insensitive)
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const ProductCard = ({ listing, product, searchQuery = "" }) => {
  const navigate = useNavigate();
  const item = listing || product;

  if (!item) return null;

  return (
    <div className="product-card" onClick={() => navigate(`/buyer/product/${item._id || item.id}`)}>
      <div className="image-container">
        <span className="category-tag">{item.category_name}</span>
        <span className="rating-tag">
          <Star size={14} fill="currentColor" /> {Number(item.rating || 0).toFixed(1)}
        </span>
        <img src={item.image_url || defaultImg} alt={item.title} className="product-img" />
      </div>
      <div className="product-info">
        {/* 2. Wrap the title and description in the helper function */}
        <h3 className="product-name">
          {getHighlightedText(item.title, searchQuery)}
        </h3>
        <p className="product-desc">
          {getHighlightedText(item.description, searchQuery)}
        </p>
        
        <div className="product-footer">
          <div className="price-wrap">
            <span className="currency">$</span>
            <span className="price">{item.price ? item.price.toFixed(2) : '0.00'}</span>
          </div>
          {item.countInStock > 0 ? (
            <span className="stock-status in-stock">{item.countInStock} in stock</span>
          ) : (
            <span className="stock-status out-of-stock">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;