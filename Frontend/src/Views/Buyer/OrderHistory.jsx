import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderHistory.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import '../../Components/Flagging.css';
import { flagSeller } from '../../Apis/Flagging';
import ReviewModal from '../../Components/ReviewModal';
import { toast } from 'react-toastify';
import CancelOrderModal from '../../Components/CancelOrderModal';

const STATUS_STYLES = {
  Pending:    { color: '#856404', background: '#fff3cd', bar: '#f4c430' },
  Processing: { color: '#084298', background: '#cfe2ff', bar: '#5092e7' },
  Shipped:    { color: '#b35900', background: '#ffe5cc', bar: '#ff8c00' },
  Delivered:  { color: '#0f5132', background: '#d1e7dd', bar: '#1a7f4b' },
  Cancelled:  { color: '#842029', background: '#f8d7da', bar: '#dc3545' },
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
  const [activeReviewOrder, setActiveReviewOrder] = useState(null);
  const [activeReviewData, setActiveReviewData] = useState(null);
  const [activeReviewListingId, setActiveReviewListingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);   // order to cancel
  const [cancelling, setCancelling] = useState(false);

  const filters = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/buyer/my-orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.orders || []);
        setOrders(list.filter(o => o.items && o.items[0]?.listing_id?.title));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleReviewSuccess = () => fetchOrders();

  const handleFlagSeller = async (orderNumber, sellerId) => {
    try {
      const response = await flagSeller(orderNumber);
      const { flags } = response.seller || {};
      const normalizedSellerId = sellerId ? String(sellerId) : null;

      setOrders(prev => prev.map(order => {
        const orderSellerId = String(order.seller_id?._id || order.seller_id || '');
        const updated = { ...order };
        if (normalizedSellerId && orderSellerId === normalizedSellerId) {
          updated.seller_id = { ...order.seller_id, flags };
        }
        if (order.orderNumber === orderNumber || order._id === orderNumber) {
          updated.buyerFlag = response.order?.buyerFlag;
        }
        return updated;
      }));
    } catch (err) {
      setError({ message: 'Failed to flag seller.', details: err.message });
    }
  };

  // ── Task 1: Cancel handler ─────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${cancelTarget._id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        // Instant UI update — no refetch needed
        setOrders(prev =>
          prev.map(o => o._id === cancelTarget._id ? { ...o, status: 'Cancelled' } : o)
        );
        toast.success('Order cancelled successfully');
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="order-history-page">
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
            <div className="oh-empty"><p>Loading orders...</p></div>
          ) : filtered.length === 0 ? (
            <div className="oh-empty">
              <div className="oh-empty-icon">&#128230;</div>
              <p>No orders found</p>
              <small>Try a different filter or place a new order</small>
              <button className="oh-shop-btn" onClick={() => navigate('/products')}>
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="oh-orders-list">
              {filtered.map(order => {
                const sellerName = order.seller_id?.username || 'Unknown Seller';
                const canCancel = ['Pending', 'Processing'].includes(order.status);

                return (
                  <div key={order._id} className="oh-order-card-item">
                    <div className="oh-order-card-header">
                      <div className="oh-order-header-main">
                        <span className="oh-order-number">
                          {order.orderNumber} · {sellerName}
                        </span>
                        <span className="oh-order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="oh-order-header-aside">
                        <StatusBadge status={order.status || 'Pending'} />
                        {/* ── Task 1: Cancel Button ── */}
                        {canCancel && (
                          <button
                            className="oh-cancel-btn"
                            onClick={() => setCancelTarget(order)}
                          >
                            Cancel Order
                          </button>
                        )}
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
                                Qty: {item.quantity} &nbsp;·&nbsp; {item.price?.toFixed(2)} LE
                              </p>
                            </div>
                            <div className="oh-sub-item-total">
                              {order.status === 'Delivered' && (
                                <button
                                  onClick={() => {
                                    setActiveReviewOrder(order);
                                    setActiveReviewData(item.review || null);
                                    setActiveReviewListingId(item.listing_id?._id || item.listing_id);
                                  }}
                                  className={`rate-item-btn ${item.review ? 'reviewed' : ''}`}
                                >
                                  {item.review ? '✏️ Edit Review' : '⭐ Rate'}
                                </button>
                              )}
                              {(item.price * item.quantity).toFixed(2)} LE
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="oh-order-total-amount">
                      Total Amount: <span>{order.totalAmount?.toFixed(2)} LE</span>
                    </div>

                    <div className="flag-buttons">
                      <p>
                        {order.buyerFlag
                          ? 'You have flagged this seller.'
                          : `Have you had a bad experience with ${sellerName}?`}
                      </p>
                      <button
                        className={`flag-btn ${order.buyerFlag ? 'active' : 'inactive'}`}
                        onClick={() => handleFlagSeller(order.orderNumber || order._id, order.seller_id?._id || order.seller_id)}
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

      {/* ── Review Modal ── */}
      {activeReviewOrder && (
        <ReviewModal
          isOpen={true}
          onClose={() => { setActiveReviewOrder(null); setActiveReviewData(null); setActiveReviewListingId(null); }}
          orderId={activeReviewOrder._id}
          listingId={activeReviewListingId}
          onSuccess={handleReviewSuccess}
          showToast={(msg, type) => type === 'error' ? toast.error(msg) : toast.success(msg)}
          existingReview={activeReviewData}
        />
      )}

      {/* ── Task 1: Cancel Confirmation Modal ── */}
      {cancelTarget && (
        <CancelOrderModal
          order={cancelTarget}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTarget(null)}
          loading={cancelling}
        />
      )}

      <Footer />
    </div>
  );
}

export default OrderHistory;