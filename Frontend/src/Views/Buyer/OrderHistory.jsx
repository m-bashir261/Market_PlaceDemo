import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './OrderHistory.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

const sampleOrders = [
  {
    id: 'ORD-001',
    productName: 'Modern Desk Lamp',
    productImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&q=80',
    seller: 'Luna Lighting',
    price: 49.99,
    quantity: 1,
    status: 'Pending',
    date: '2026-04-10',
  },
  {
    id: 'ORD-002',
    productName: 'Wireless Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80',
    seller: 'SoundWave',
    price: 89.99,
    quantity: 2,
    status: 'Shipped',
    date: '2026-04-08',
  },
  {
    id: 'ORD-003',
    productName: 'Mechanical Keyboard',
    productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&q=80',
    seller: 'TechStore',
    price: 120.00,
    quantity: 1,
    status: 'Delivered',
    date: '2026-04-05',
  },
  {
    id: 'ORD-004',
    productName: 'Leather Wallet',
    productImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=120&q=80',
    seller: 'StyleHub',
    price: 35.00,
    quantity: 1,
    status: 'Cancelled',
    date: '2026-04-01',
  },
];

const STATUS_STYLES = {
  Pending:   { color: '#856404', background: '#fff3cd', bar: '#f4c430' },
  Processing:{ color: '#084298', background: '#cfe2ff', bar: '#5092e7' },
  Shipped:   { color: '#b35900', background: '#ffe5cc', bar: '#ff8c00' },
  Delivered: { color: '#0f5132', background: '#d1e7dd', bar: '#1a7f4b' },
  Cancelled: { color: '#842029', background: '#f8d7da', bar: '#dc3545' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <div className="order-status-wrapper">
      <div className="status-bar-track">
        <div className="status-bar-fill" style={{ background: s.bar, width: getBarWidth(status) }} />
      </div>
      <span className="status-label" style={{ color: s.color, background: s.background }}>
        {status}
      </span>
    </div>
  );
}

function getBarWidth(status) {
  const widths = { Pending: '20%', Processing: '45%', Shipped: '70%', Delivered: '100%', Cancelled: '100%' };
  return widths[status] || '20%';
}

function OrderHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const filters = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="order-history-page">

      {/* ── Navbar ── */}
      <Navbar />

      <main className="page-body">

        {/* ── Page Header ── */}
        <div className="oh-page-header">
          <div>
            <h1 className="oh-title">My Orders</h1>
            <p className="oh-subtitle">Track and manage all your purchases</p>
          </div>
          <div className="oh-count-badge">{filtered.length} of {orders.length} orders</div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="oh-filters">
          {filters.map(f => (
            <button
              key={f}
              className={`oh-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Orders Card ── */}
        <div className="oh-card">
          <div className="oh-card-header">
            <h2>Recent Orders</h2>
            <span className="oh-order-count">{filtered.length} orders</span>
          </div>

          {loading ? (
            <div className="oh-empty">
              <p>Loading orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="oh-empty">
              <div className="oh-empty-icon">&#128230;</div>
              <p>No orders found</p>
              <small>Try a different filter or place a new order</small>
              <button className="oh-shop-btn" onClick={() => navigate('/catalog')}>
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="oh-orders-list">
              {filtered.map(order => {
                const firstItem = order.items && order.items[0] ? order.items[0] : null;
                const pName = firstItem?.listing_id?.title || 'Multiple Items';
                const pImage = firstItem?.listing_id?.image_urls?.[0] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&q=80';
                const sellerName = order.seller_id?.username || 'Unknown Seller';
                const totalQty = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                
                return (
                  <div key={order._id} className="oh-order-item">

                    {/* Product Image */}
                    <div className="oh-product-image">
                      <img src={pImage} alt={pName} />
                    </div>

                    {/* Order Info */}
                    <div className="oh-order-info">
                      <p className="oh-product-name">{pName} {order.items?.length > 1 ? `(+${order.items.length - 1} more)` : ''}</p>
                      <p className="oh-meta">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                        &nbsp;·&nbsp; Qty: {totalQty}
                        &nbsp;·&nbsp; Seller: {sellerName}
                        &nbsp;·&nbsp; {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Status */}
                    <StatusBadge status={order.status || 'Pending'} />

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}

export default OrderHistory;