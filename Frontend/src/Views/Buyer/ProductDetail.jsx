import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetail.css';

const sampleProducts = [
  {
    id: '1',
    name: 'Modern Desk Lamp',
    price: 49.99,
    seller: 'Luna Lighting',
    description:
      'A warm LED desk lamp with adjustable brightness, ideal for home offices and reading corners.',
    image: 'https://m.media-amazon.com/images/I/71Jh2BN+QPL.jpg',
    category: 'Home Decorations',
    stock: 12,
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    price: 89.99,
    seller: 'SoundWave',
    description:
      'High-quality wireless headphones with active noise cancellation and 24-hour battery life.',
    image: 'https://image-cdn.ubuy.com/topvision-noise-cancelling-headphones/400_400_100/696c8c1a48e3557eb800de7f.jpg',
    category: 'Electronics',
    stock: 8,
  },
];

function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? 'star filled' : 'star'}>
          &#9733;
        </span>
      ))}
      <span className="rating-number">{rating}</span>
    </div>
  );
}
 
function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [orderCreated, setOrderCreated] = useState(false);
 
  const product = useMemo(
    () => sampleProducts.find((item) => item.id === id) || sampleProducts[0],
    [id]
  );
 
  const totalPrice = useMemo(
    () => Number((product.price * quantity).toFixed(2)),
    [product.price, quantity]
  );
 
  const handleQuantityChange = (event) => {
    const value = Number(event.target.value);
    if (value < 1) { setQuantity(1); return; }
    if (value > product.stock) { setQuantity(product.stock); return; }
    setQuantity(value);
  };
 
  const handlePlaceOrder = () => {
    setOrderCreated(true);
  };
 
  return (
    <div className="product-detail-page">
 
      {/* ── Navbar ── */}
      <header className="product-detail-header-bar">
        <div className="header-logo">
          <span className="header-logo-icon">&#128722;</span>
          <span className="header-logo-label">MarketPlace</span>
        </div>
        <nav className="header-nav">
          <a href="/" className="nav-link">Home</a>
          <a href="/catalog" className="nav-link">Catalog</a>
          <Link to="/buyer/orders" className="nav-link">My Orders</Link>
        </nav>
        <div className="header-user">
          <div className="avatar">B</div>
          <span className="header-username">Buyer</span>
        </div>
      </header>
 
      <main className="page-body">
 
        {/* ── Breadcrumb ── */}
        <nav className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a>
          <span className="breadcrumb-sep">›</span>
          <a href="/catalog" className="breadcrumb-link">Catalog</a>
          <span className="breadcrumb-sep">›</span>
          <a href={`/catalog?category=${product.category}`} className="breadcrumb-link">
            {product.category}
          </a>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>
 
        {/* ── Main Product Card ── */}
        <section className="product-detail-card">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>
 
          <div className="product-detail-info">
            <div className="product-detail-top">
              <div>
                <p className="product-category">{product.category}</p>
                <h1>{product.name}</h1>
              </div>
              <span className="product-price">${product.price.toFixed(2)}</span>
            </div>
 
            <p className="product-description">{product.description}</p>
 
            <div className="product-meta-row">
              <div>
                <span className="label">Seller</span>
                <p>{product.seller}</p>
              </div>
              <div>
                <span className="label">Available</span>
                <p>{product.stock} in stock</p>
              </div>
              <div>
                <span className="label">Delivery</span>
                <p>{product.deliveryTime}</p>
              </div>
            </div>
 
            <div className="order-controls">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
 
            <div className="order-summary">
              <p><strong>Total</strong></p>
              <p className="total-price">${totalPrice.toFixed(2)}</p>
            </div>
 
            <button
              className="place-order-button"
              type="button"
              onClick={handlePlaceOrder}
              disabled={orderCreated}
            >
              {orderCreated ? '✓ Order Confirmed' : 'Place Order'}
            </button>
          </div>
        </section>
 
        {/* ── Seller Mini Card ── */}
        <section className="seller-card">
          <h2 className="section-title">About the Seller</h2>
          <div className="seller-card-inner">
            <div className="seller-avatar-large">
              {product.seller.charAt(0)}
            </div>
            <div className="seller-card-info">
              <h3 className="seller-card-name">{product.seller}</h3>
              <StarRating rating={product.sellerRating} />
              <p className="seller-sales">{product.sellerSales} sales completed</p>
            </div>
            <a href={`/shop/${product.seller}`} className="view-shop-btn">
              View Shop
            </a>
          </div>
        </section>
 
        {/* ── Reviews Placeholder ── */}
        <section className="reviews-section">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="reviews-placeholder">
            <p className="reviews-placeholder-title">No reviews yet</p>
            <p className="reviews-placeholder-sub">
              Placeholder for next sprint
            </p>
          </div>
        </section>
 
      </main>
    </div>
  );
}
 
export default ProductDetail;
 