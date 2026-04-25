import React from 'react';
import { Star } from 'lucide-react';
const defaultImg = "https://i.ibb.co/000000/default-image.jpg";

const ProductCard = ({ listing }) => {
  return (
    <div className="product-card">
      <div className="image-container">
        <span className="category-tag">{listing.category_name}</span>
        <span className="rating-tag">
          <Star size={14} fill="currentColor" /> {Number(listing.rating || 0).toFixed(1)}
        </span>
        <img src={listing.image_url || defaultImg} alt={listing.title} className="product-img" />
      </div>
      <div className="product-info">
        {/* <div className="product-brand">{listing.brand || 'Local Brand'}</div> */}
        <h3 className="product-name">{listing.title}</h3>
        <p className="product-desc">{listing.description}</p>
        <div className="product-footer">
          <div className="price-wrap">
            <span className="currency">$</span>
            <span className="price">{listing.price.toFixed(2)}</span>
          </div>
          {listing.countInStock > 0 ? (
            <span className="stock-status in-stock">{listing.countInStock} in stock</span>
          ) : (
            <span className="stock-status out-of-stock">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
