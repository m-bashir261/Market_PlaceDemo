// Components/SellerDashboard/StatsBar.jsx
import React, { useState, useEffect } from 'react';
import { getSellerListings, getIncomingOrders } from '../../Apis/Seller';
import './Dashboard.css';

const StatsBar = () => {
    const [stats, setStats] = useState({
        activeListings: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const listings = await getSellerListings();
                const active = listings.filter(listing => listing.is_active === true);
                
                const response = await getIncomingOrders();
                console.log("Incoming orders:", response.orders);
                const pending = response.orders.filter(order => order.status === 'Pending' || order.status === 'Processing');
                const revenue = response.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

                setStats({
                    activeListings: active.length,
                    totalOrders: response.orders.length,
                    pendingOrders: pending.length,
                    totalRevenue: revenue,
                });
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('Could not load dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ icon, label, value, color, isLoading }) => (
        <div className={`stat-card stat-card--${color}`}>
            <div className="stat-card__top">
                <span className="stat-card__icon">{icon}</span>
                <h4 className="stat-card__label">{label}</h4>
            </div>
            {isLoading ? (
                <div className="stat-card__skeleton"></div>
            ) : (
                <p className="stat-card__value">{value}</p>
            )}
        </div>
    );

    if (error) {
        return <div className="stats-error">{error}</div>;
    }

    return (
        <div className="stats-container">
            <div className="stats-grid">
                <StatCard
                    icon="📦"
                    label="Active Listings"
                    value={stats.activeListings}
                    color="blue"
                    isLoading={loading}
                />
                <StatCard
                    icon="📊"
                    label="Total Orders"
                    value={stats.totalOrders}
                    color="green"
                    isLoading={loading}
                />
                <StatCard
                    icon="⏳"
                    label="Pending Orders"
                    value={stats.pendingOrders}
                    color="amber"
                    isLoading={loading}
                />
                    <StatCard
                        icon="💰"
                        label="Total Revenue"
                        value={`${stats.totalRevenue.toLocaleString()} EGP`}
                        color="yellow"
                        isLoading={loading}
                    />
            </div>
        </div>
    );
};

export default StatsBar;