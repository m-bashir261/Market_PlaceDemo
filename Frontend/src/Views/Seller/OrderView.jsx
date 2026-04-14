// OrderView.jsx
import React, { useState, useMemo } from 'react';
import './Seller.css';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'; 

export default function OrderView() {
const [orders, setOrders] = useState([
    {
    id: 'ORD-001',
    customer: 'John Doe',
    date: '2026-04-08',
    items: 3,
    total: 149.99,
    status: 'cancelled',
},
{
    id: 'ORD-002',
    customer: 'Jane Smith',
    date: '2026-04-09',
    items: 2,
    total: 89.50,
    status: 'processing',
},
{
    id: 'ORD-003',
    customer: 'Mike Johnson',
    date: '2026-04-07',
    items: 5,
    total: 249.99,
    status: 'shipped',
},
    {
    id: 'ORD-004',
    customer: 'John Doe Jr.',
    date: '2026-04-08',
    items: 3,
    total: 149.99,
    status: 'pending',
},
{
    id: 'ORD-005',
    customer: 'Jane Smith',
    date: '2026-04-09',
    items: 2,
    total: 89.50,
    status: 'processing',
},
{
    id: 'ORD-006',
    customer: 'Mike Johnson',
    date: '2026-04-07',
    items: 5,
    total: 249.99,
    status: 'delivered',
},
]);
const navigate = useNavigate()
const [selectedOrderId, setSelectedOrderId] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('');
const [selectedStatus, setSelectedStatus] = useState(null);

// Filter and search logic
const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
        // Search filter - checks order ID and customer name
        const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === '' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });
}, [orders, searchTerm, statusFilter]);

const handleUpdateStatus = (orderId) => {
setSelectedOrderId(orderId);
// Find the current status of the order
const order = orders.find(o => o.id === orderId);
    if (order) {
        setSelectedStatus(order.status);
    }
};

const closeModal = () => {
    setSelectedOrderId(null);
    setSelectedStatus(null);
};

const handleSaveStatus = () => {
    if (selectedStatus && selectedOrderId) {
        setOrders(orders.map(order =>
        order.id === selectedOrderId
            ? { ...order, status: selectedStatus }
            : order
        ));
        closeModal();
    }
};



return (
    <div className="seller-dashboard">
        {/* Seller Header Bar */}
        <div className="seller-header">
        <div className="seller-badge">
            <span className="badge-icon">👤</span>
            <span className="seller-label">Seller Dashboard, Welcome John!</span>
        </div>
        <div className="New-Listing-Button">
            <Link to="/seller/listings/create" className="create-listing-btn">
             Create New Listing
            </Link>
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
                placeholder="Search order ID or customer..."
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
            /* Orders List (Card-based instead of table) */
            <div className="orders-list">
                {filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                    <div className="order-header-row">
                    <div className="order-id-section">
                        <span className="order-id">{order.id}</span>
                        <span className={`status-badge badge-${order.status}`}>
                        {order.status.toUpperCase()}
                        </span>
                    </div>
                    <div className="order-amount">
                        ${order.total.toFixed(2)}
                    </div>
                    </div>

                    <div className="order-details">
                    <div className="detail-item">
                        <span className="detail-label">Customer</span>
                        <span className="detail-value">{order.customer}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{order.date}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Items</span>
                        <span className="detail-value">{order.items} items</span>
                    </div>
                    </div>

                    <div className="order-actions">
                    <button className="action-btn btn-view">
                        View Details
                    </button>
                    <button
                        className="action-btn btn-update"
                        onClick={() => handleUpdateStatus(order.id)}
                    >
                        ✎ Update Status
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>

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
                <label>
                    <input type="radio" name="status" value="pending" /> Pending
                </label>
                <label>
                    <input type="radio" name="status" value="processing" /> Processing
                </label>
                <label>
                    <input type="radio" name="status" value="shipped" /> Shipped
                </label>
                <label>
                    <input type="radio" name="status" value="delivered" /> Delivered
                </label>
                <label>
                    <input type="radio" name="status" value="cancelled" /> Cancelled
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