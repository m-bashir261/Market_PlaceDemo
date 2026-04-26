import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const defaultImg = "https://i.ibb.co/000000/default-image.jpg";

const ProductCard = ({ listing, product }) => {
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
        {/* <div className="product-brand">{item.brand || 'Local Brand'}</div> */}
        <h3 className="product-name">{item.title}</h3>
        <p className="product-desc">{item.description}</p>
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
