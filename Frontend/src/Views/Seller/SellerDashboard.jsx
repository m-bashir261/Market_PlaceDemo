import React, {useState, useEffect} from 'react';
import '../../Components/SellerDashboard/Dashboard.css';
import Sidebar from '../../Components/SellerDashboard/Sidebar';
import Statsbar from '../../Components/SellerDashboard/Statsbar';
import ListingPreview from '../../Components/SellerDashboard/ListingPreview';
import LoadingScreen from '../Loading';

import { getMe } from '../../Apis/authApi';
import { getSellerListings, getIncomingOrders } from '../../Apis/Seller';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


export default function SellerDashboard() {
    const [sellerName, setSellerName] = useState('');
    const [error, setError] = useState(null);
    const [activeListings, setActiveListings] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const tokenExpired =  async () => {
            try {
                await getMe();
                return true;
            } catch (error) {
                console.error("i am in token expired catch block");
                if (error.status === 401) {
                navigate('/login');
                toast.error("Session expired. Please log in again.");
                return false; // Token expired, stop execution
                } else {
                    setError({
                    message: "An error occurred while verifying your session.",
                    details: error.message
                });
                return false; // Other error, stop execution
                }
            }
        };
        const fetchListings = async () => {
            try {
                const res = await getSellerListings();
                // Assuming res.data is an array of listings
                const active = res.filter(listing => listing.is_active === true);
                console.log("Active listings:", active);
                setActiveListings(active);
            } catch (err) {
                console.error('Failed to fetch listings', err);
            } finally {
                setLoading(false);
            }
        };
        const fetchOrders = async () => {
            try {
                setOrdersLoading(true);
                const res = await getIncomingOrders();
                // API returns { success, count, message, orders }
                setOrders(res.orders ? res.orders : Array.isArray(res) ? res : []);
            } catch (err) {
                console.error('Failed to fetch orders', err);
            } finally {
                setOrdersLoading(false);
            }
        };

        const fetchUser = async () => {
            try{
                const user = await getMe();
                setSellerName(user.firstName);
            } catch (error) {
                setError({
                    message: "Unable to load seller information. Please contact the developer.",
                    details: error.message
                });
            }
        };
        const initialize = async () => {
            const isTokenValid = await tokenExpired();
            if (isTokenValid) {
                await fetchUser();
                await fetchListings();
                await fetchOrders();
            }
        };
        initialize();
    }, []);

    return (
        <div className="seller-dashboard">
            <Sidebar username={sellerName} />
            <main className="dashboard-main">   {/* ← This gives margin-left: 240px */}
                <div className="dashboard-header">
                    <h1>Welcome, {sellerName}!</h1>
                </div>
                <Statsbar />
                {/* Quick Access: Recent Orders */}
                <section className="recent-orders-section" style={{ margin: '32px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h2 style={{ margin: 0 }}>Recent Orders</h2>
                        <button
                            onClick={() => navigate('/seller/orders')}
                            style={{
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: 14
                            }}
                            aria-label="View all orders"
                        >
                            View All Orders
                        </button>
                    </div>
                    {ordersLoading ? (
                        <div>Loading recent orders...</div>
                    ) : orders && orders.length > 0 ? (
                        <div className="recent-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {orders.slice(0, 5).map(order => (
                                <div key={order._id} className="recent-order-card" style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>Order #{order.orderNumber || order._id}</strong> &nbsp;
                                            <span style={{ fontSize: 13, color: '#666' }}>{order.status}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: '#888' }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</div>
                                    </div>
                                    <div style={{ fontSize: 14, marginTop: 4 }}>
                                        {order.items && order.items.length > 0 && (
                                            <span>
                                                {order.items[0].listing_id?.title || 'Product'}
                                                {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ marginTop: 6, fontSize: 13, color: '#444' }}>
                                        Buyer: {order.buyer_id?.firstName} {order.buyer_id?.lastName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>No recent orders found.</div>
                    )}
                </section>
                <ListingPreview />
            </main>
        </div>
    );
}