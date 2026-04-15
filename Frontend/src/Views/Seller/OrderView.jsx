import React, { useState, useEffect, useMemo } from 'react';
import { getIncomingOrders, updateOrderStatus } from '../../Apis/Seller'; // Ensure this path matches your project structure
import './Seller.css';

export default function OrderView() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Filter State
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);

    // Fetch orders when the component loads
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getIncomingOrders();
                setOrders(data);
            } catch (error) {
                alert("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter and search logic
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchStr = searchTerm.toLowerCase();
            
            // Map search to MongoDB _id and the Listing Title (since we bypassed the User model)
            const matchesSearch =
                (order._id && order._id.toLowerCase().includes(searchStr)) ||
                (order.listing_id?.title && order.listing_id.title.toLowerCase().includes(searchStr));

            const matchesStatus = statusFilter === '' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    // Open Modal
    const handleUpdateStatusClick = (orderId) => {
        setSelectedOrderId(orderId);
        // Find the current status of the order using MongoDB _id
        const order = orders.find(o => o._id === orderId);
        if (order) {
            setSelectedStatus(order.status);
        }
    };

    // Close Modal
    const closeModal = () => {
        setSelectedOrderId(null);
        setSelectedStatus(null);
    };

    // Execute API call and update UI
    const handleSaveStatus = async () => {
        if (selectedStatus && selectedOrderId) {
            try {
                // 1. Send update to the backend
                await updateOrderStatus(selectedOrderId, selectedStatus);

                // 2. If successful, update the local UI state
                setOrders(orders.map(order =>
                    order._id === selectedOrderId
                        ? { ...order, status: selectedStatus }
                        : order
                ));
                closeModal();
            } catch (error) {
                alert("Failed to update order status. Check console for details.");
            }
        }
    };

    if (loading) return <p>Loading orders...</p>;

    return (
        <div className="seller-dashboard">
            {/* Seller Header Bar */}
            <div className="seller-header">
                <div className="seller-badge">
                    <span className="badge-icon">👤</span>
                    <span className="seller-label">Seller Dashboard, Welcome!</span>
                </div>
                <div className="seller-info">
                    <span className="seller-name">YourStore</span>
                    <button className="seller-menu-btn">⋮</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Top Section with Title and Controls */}
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
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="orders-card">
                    <div className="card-header">
                        <h2>Recent Orders</h2>
                        <span className="order-count">
                            {filteredOrders.length} of {orders.length} orders
                        </span>
                    </div>

                    {/* No Results Message */}
                    {filteredOrders.length === 0 ? (
                        <div className="no-results">
                            <span className="no-results-icon">📭</span>
                            <p>No orders found</p>
                            <small>Try adjusting your search or filters</small>
                        </div>
                    ) : (
                        /* Orders List */
                        <div className="orders-list">
                            {filteredOrders.map((order) => (
                                <div key={order._id} className="order-card">
                                    
                                    {/* LEFT COLUMN: The Image */}
                                    <div className="order-image-container">
                                        {order.listing_id?.image_urls && order.listing_id.image_urls.length > 0 ? (
                                            <img 
                                                src={order.listing_id.image_urls[0]} 
                                                alt={order.listing_id?.title || 'Item'} 
                                                className="order-thumbnail"
                                            />
                                        ) : (
                                            <div className="order-thumbnail placeholder">
                                                <span>📷</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* RIGHT COLUMN: All Order Info and Actions */}
                                    <div className="order-info-container">
                                        
                                        {/* Header (ID, Status, Price) */}
                                        <div className="order-header-row">
                                            <div className="order-id-section">
                                                <span className="order-id">{order._id}</span>
                                                <span className={`status-badge badge-${order.status}`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="order-amount">
                                                ${order.listing_id?.price?.toFixed(2) || '0.00'}
                                            </div>
                                        </div>

                                        {/* Details (Item Name, Date, Customer) */}
                                        <div className="order-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Item</span>
                                                <span className="detail-value text-primary">
                                                    {order.listing_id?.title || 'Unknown Item'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Date</span>
                                                <span className="detail-value">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Customer ID</span>
                                                <span className="detail-value text-muted">
                                                    {order.buyer_id}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions (Buttons) */}
                                        <div className="order-actions">
                                            <button className="action-btn btn-view">
                                                View Details
                                            </button>
                                            <button
                                                className="action-btn btn-update"
                                                onClick={() => handleUpdateStatusClick(order._id)}
                                            >
                                                ✎ Update Status
                                            </button>
                                        </div>
                                        
                                    </div> {/* End of Right Column */}

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedOrderId && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="update-status-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Update Status</h2>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-content">
                            <p>Order: <strong>{selectedOrderId}</strong></p>

                            <div className="status-options">
                                {/* Added checked and onChange handlers to the radio buttons to link them to React state */}
                                <label>
                                    <input type="radio" name="status" value="pending" checked={selectedStatus === 'pending'} onChange={(e) => setSelectedStatus(e.target.value)} /> Pending
                                </label>
                                <label>
                                    <input type="radio" name="status" value="processing" checked={selectedStatus === 'processing'} onChange={(e) => setSelectedStatus(e.target.value)} /> Processing
                                </label>
                                <label>
                                    <input type="radio" name="status" value="shipped" checked={selectedStatus === 'shipped'} onChange={(e) => setSelectedStatus(e.target.value)} /> Shipped
                                </label>
                                <label>
                                    <input type="radio" name="status" value="delivered" checked={selectedStatus === 'delivered'} onChange={(e) => setSelectedStatus(e.target.value)} /> Delivered
                                </label>
                                <label>
                                    <input type="radio" name="status" value="cancelled" checked={selectedStatus === 'cancelled'} onChange={(e) => setSelectedStatus(e.target.value)} /> Cancelled
                                </label>
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
    );
}