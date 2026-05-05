import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './OrderHistory.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import '../../Components/Flagging.css';
import { flagSeller } from '../../Apis/Flagging';

const STATUS_STYLES = {
  Pending: { color: '#856404', background: '#fff3cd', bar: '#f4c430' },
  Processing: { color: '#084298', background: '#cfe2ff', bar: '#5092e7' },
  Shipped: { color: '#b35900', background: '#ffe5cc', bar: '#ff8c00' },
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
  const [error, setError] = useState(null);
  const filters = ['All', 'Pending', 'Processing','Shipped', 'Delivered', 'Cancelled'];  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.warn("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/orders/buyer/my-orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const ordersList = Array.isArray(data) ? data : (data.orders || []);

          // Filter out orders where the product data isn't populated
          const validOrders = ordersList.filter(
            order => order.items && order.items[0]?.listing_id?.title
          );

          setOrders(validOrders);
        } else {
          console.error("Failed to fetch orders:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle flagging seller
  const handleFlagSeller = async (orderNumber, sellerId) => {
    try {
        const response = await flagSeller(orderNumber);
        // Backend returns seller stats in response.seller
        const { flags } = response.seller || {};
        const normalizedSellerId = sellerId ? String(sellerId) : null;

        setOrders(prevOrders => prevOrders.map(order => {
          const orderSellerId = String(order.seller_id?._id || order.seller_id || '');
          const updatedOrder = { ...order };

          if (normalizedSellerId && orderSellerId === normalizedSellerId) {
            updatedOrder.seller_id = {
              ...order.seller_id,
              flags: flags
            };
          }

          if (order.orderNumber === orderNumber || order._id === orderNumber) {
            updatedOrder.buyerFlag = response.order?.buyerFlag;
          }

          return updatedOrder;
        }));
    } catch (error) {
      setError({
        message: "Failed to flag seller. Check console for details.",
        details: error.message
      });
    }
  };

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
                const pName = firstItem?.listing_id?.title || 'Unknown Product';
                const pImage = firstItem?.listing_id?.image_urls?.[0] || '';
                const sellerName = order.seller_id?.username || 'Unknown Seller';
                const totalQty = order.items
                  ? order.items.reduce((sum, item) => sum + item.quantity, 0)
                  : 0;

                return (
                  <div key={order._id} className="oh-order-card-item">
                    <div className="oh-order-card-header">
                      <div className="oh-order-header-main">
                        <span className="oh-order-number">Seller: {sellerName}</span>
                        <span className="oh-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="oh-order-header-aside">
                        <StatusBadge status={order.status || 'Pending'} />
                      </div>
                    </div>

                    <div className="oh-order-items-list">
                      {order.items.map((item, idx) => {
                        const itemTitle = item.listing_id?.title || 'Unknown Product';
                        const itemImage = item.listing_id?.image_urls?.[0] || '';
                        return (
                          <div key={item._id || idx} className="oh-sub-item">
                            <div className="oh-sub-item-image">
                              {itemImage
                                ? <img src={itemImage} alt={itemTitle} />
                                : <div className="oh-image-placeholder">📦</div>
                              }
                            </div>
                            <div className="oh-sub-item-info">
                              <p className="oh-sub-item-name">{itemTitle}</p>
                              <p className="oh-sub-item-meta">
                                Qty: {item.quantity} &nbsp;·&nbsp; ${item.price?.toFixed(2)}
                              </p>
                            </div>
                            <div className="oh-sub-item-total">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="oh-order-total-amount">
                      Total Amount: <span>${order.totalAmount?.toFixed(2)}</span>
                    </div>
                    
                    <div className="flag-buttons">
                      <p>
                        {order.buyerFlag ? 'You have flagged this seller.' : `Have you had a bad experience with ${sellerName}?`}
                      </p>
                      <button
                        className={`flag-btn ${order.buyerFlag ? 'active' : 'inactive'}`}
                        onClick={() => handleFlagSeller(order.orderNumber || order._id, order.seller_id?._id || order.seller_id)}
                        title={order.buyerFlag ? 'Unflag this seller' : 'Flag this seller'}
                      >
                        {order.buyerFlag ? '🚩 Flagged' : '🚩 Flag seller'}
                      </button>
                  </div>
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