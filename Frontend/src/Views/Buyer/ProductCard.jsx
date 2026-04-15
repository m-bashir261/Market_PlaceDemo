import React from 'react';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="image-container">
        <span className="category-tag">{product.category}</span>
        <span className="rating-tag">
          <Star size={14} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}
        </span>
        <img src={product.imageUrl} alt={product.name} className="product-img" />
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand || 'Local Brand'}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <div className="price-wrap">
            <span className="currency">$</span>
            <span className="price">{product.price.toFixed(2)}</span>
          </div>
          {product.countInStock > 10 ? (
            <span className="stock-status in-stock">In Stock</span>
          ) : product.countInStock > 0 ? (
            <span className="stock-status low-stock">Low Stock</span>
          ) : (
            <span className="stock-status out-of-stock">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
