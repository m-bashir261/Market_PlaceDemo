import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getIncomingOrders, updateOrderStatus} from '../../Apis/Seller';
import { flagBuyer } from '../../Apis/Flagging';
import { getMe } from '../../Apis/authApi';
import '../../Components/Flagging.css';
import LoadingScreen from '../Loading';
import Navbar from '../Navbar/Navbar';

export default function OrderView() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [sellerName, setSellerName] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getMe();
                setSellerName(user.firstName);
            } catch (error) {
                // Non-blocking error for user fetch
                console.error("User fetch error:", error);
            }
        };

        const fetchOrders = async () => {
            try {
                const data = await getIncomingOrders();
                const ordersList = Array.isArray(data) ? data : (data.orders || []);
                setOrders(ordersList);
            } catch (error) {
                setError({
                    message: "Unable to load orders. Please contact the developer.",
                    details: error.message
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchStr = searchTerm.toLowerCase();

            const matchesSearch =
                (order.orderNumber && String(order.orderNumber).toLowerCase().includes(searchStr)) ||
                (order._id && order._id.toLowerCase().includes(searchStr)) ||
                (order.items && order.items.some(item =>
                    item.listing_id?.title && item.listing_id.title.toLowerCase().includes(searchStr)
                ));

            // FIX 1: Ensure case-insensitive comparison for status filtering
            const matchesStatus = statusFilter === '' ||
                (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const handleUpdateStatusClick = (orderNumber) => {
        const order = orders.find(o => o.orderNumber === orderNumber);
        if (order) {
            setSelectedOrderNumber(orderNumber);
            setSelectedStatus(order.status);
            setSelectedOrderDetails(order);
        }
    };

    const closeModal = () => {
        setSelectedOrderNumber(null);
        setSelectedStatus(null);
        setSelectedOrderDetails(null);
    };

    const handleSaveStatus = async () => {
        if (selectedStatus && selectedOrderNumber) {
            try {
                await updateOrderStatus(selectedOrderNumber, selectedStatus);

                setOrders(prevOrders => prevOrders.map(order =>
                    order.orderNumber === selectedOrderNumber
                        ? { ...order, status: selectedStatus }
                        : order
                ));
                closeModal();
            } catch (error) {
                setError({
                    message: "Failed to update order status. Check console for details.",
                    details: error.message
                });
            }
        }
    };

    // Handle flagging buyer
    const handleFlagBuyer = async (orderNumber, flag) => {
        try {
            const response = await flagBuyer(orderNumber, flag);
            // Backend returns buyer stats in response.buyer with camelCase keys
            const { upVotes, downVotes } = response.buyer || {};

            setOrders(orders.map(order =>
                order.orderNumber === orderNumber
                    ? { 
                        ...order, 
                        sellerFlag: response.order?.sellerFlag,
                        buyer_id: {
                            ...order.buyer_id,
                            upVotes: upVotes,
                            downVotes: downVotes
                        }
                    }
                    : order
            ));
        } catch (error) {
            setError({
                message: "Failed to flag buyer. Check console for details.",
                details: error.message
            });
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        error ? (
            <div className="error-message full-page">
                <h2>{error.message}</h2>
                <pre>{error.details}</pre>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        ) : (
            <div className="seller-dashboard">
                <Navbar role="seller" name={sellerName} />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div className="header-left">
                            <h1>Your Sales Orders</h1>
                            <p className="subtitle">Track and manage all incoming orders</p>
                        </div>
                        <div className="header-right">
                            <div className="search-group">
                                <input
                                    type="text"
                                    placeholder="Search order ID or Item Title..."
                                    className="form-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {/* FIX 3: Ensure option values match the case used in your database */}
                            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="orders-card">
                        <div className="card-header">
                            <h2>Recent Orders</h2>
                            <span className="order-count">
                                {filteredOrders.length} of {orders.length} orders
                            </span>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="no-results">
                                <span className="no-results-icon">📭</span>
                                <p>No orders found</p>
                                <small>Try adjusting your search or filters</small>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {filteredOrders.map((order) => (
                                    <div key={order._id} className="order-card">
                                        <div className="order-card-header-row">
                                            <div className="order-id-section">
                                                <span className="order-id">Order ID: {order.orderNumber}</span>
                                                {/* FIX 4: Safety check for order.status before toUpperCase */}
                                                <span className={`status-badge badge-${order.status?.toLowerCase()}`}>
                                                    {order.status ? order.status.toUpperCase() : 'UNKNOWN'}
                                                </span>
                                            </div>
                                            <div className="order-card-date">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="order-items-group">
                                            {order.items.map((item, idx) => (
                                                <div key={item._id || idx} className="order-sub-item">
                                                    <div className="sub-item-img">
                                                        {item.listing_id?.image_urls?.[0] ? (
                                                            <img src={item.listing_id.image_urls[0]} alt={item.listing_id?.title} />
                                                        ) : (
                                                            <div className="img-placeholder">📦</div>
                                                        )}
                                                    </div>
                                                    <div className="sub-item-details">
                                                        <span className="sub-item-name">{item.listing_id?.title || 'Unknown Product'}</span>
                                                        <span className="sub-item-meta">Qty: {item.quantity} · ${item.price?.toFixed(2)}</span>
                                                    </div>
                                                    <div className="sub-item-price">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-card-footer-info">
                                            <div className="detail-item">
                                                <span className="detail-label">Customer Name</span>
                                                    {order.buyer_id?.firstName} {order.buyer_id?.lastName}
                                                    
                                                    {/* REPUTATION SECTION */}
                                                    <span className="customer-reputation" style={{ marginLeft: '10px', fontSize: '0.9em' }}>
                                                        <span title="Total Good Flags">
                                                            👍🏻 {order.buyer_id?.upVotes || 0}
                                                        </span>
                                                        <span title="Total Bad Flags" style={{ marginLeft: '8px' }}>
                                                            👎🏻 {order.buyer_id?.downVotes || 0}
                                                        </span>
                                                    </span>
                                                <div className="order-total-price">
                                                    Total: <span>${order.totalAmount?.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="order-actions">
                                                <button className="action-btn btn-view">View Details</button>
                                                <button
                                                    className="action-btn btn-update"
                                                    onClick={() => handleUpdateStatusClick(order.orderNumber)}
                                                >
                                                    ✎ Update Status
                                                </button>
                                                <div className="flag-buttons">
                                                    <p>
                                                        🚩 Flag User
                                                    </p>
                                                    <button
                                                        className={`flag-btn flag-good ${order.sellerFlag === 'good' ? 'active' : 'inactive'}`}
                                                        onClick={() => handleFlagBuyer(order.orderNumber, 'good')}
                                                        title={order.sellerFlag === 'good' ? 'Remove good vote' : 'Flag buyer as good'}
                                                    >
                                                        👍🏻
                                                    </button>
                                                    <button
                                                        className={`flag-btn flag-bad ${order.sellerFlag === 'bad' ? 'active' : 'inactive'}`}
                                                        onClick={() => handleFlagBuyer(order.orderNumber, 'bad')}
                                                        title={order.sellerFlag === 'bad' ? 'Remove bad vote' : 'Flag buyer as bad'}
                                                    >
                                                        👎🏻
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedOrderNumber && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="update-status-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Update Status</h2>
                                <button className="close-btn" onClick={closeModal}>✕</button>
                            </div>

                            <div className="modal-content">
                                <p>Customer: <strong>{selectedOrderDetails?.buyer_id?.firstName} {selectedOrderDetails?.buyer_id?.lastName}</strong></p>
                                <p>Order ID: <strong>{selectedOrderNumber}</strong></p>

                                <div className="status-options">
                                    {/* FIX 5: Normalize value case (e.g., 'pending' vs 'Pending') to match your DB strategy */}
                                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(stat => (
                                        <label key={stat}>
                                            <input
                                                type="radio"
                                                name="status"
                                                value={stat}
                                                checked={selectedStatus?.toLowerCase() === stat}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                            />
                                            {stat.charAt(0).toUpperCase() + stat.slice(1)}
                                        </label>
                                    ))}
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                                    <button className="btn-save" onClick={handleSaveStatus}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    );
};