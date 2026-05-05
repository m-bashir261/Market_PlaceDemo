import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { getSellerListings, deleteListing } from "../../Apis/Seller";
import { getMe } from '../../Apis/authApi'; // New API call to fetch user info
import LoadingScreen from "../Loading";
import "./Seller.css";

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sellerName, setSellerName] = useState('');
    const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
    const [confirmDelete, setConfirmDelete] = useState(null); // listing id to delete

    const navigate = useNavigate();

    useEffect(() => {
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
        fetchUser();
        getSellerListings()
            .then((data) => {
                setListings(data);
            })
            .catch((error) => {
                console.error("Error fetching listings:", error);
                setError({ message: error.message });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDeleteClick = (id) => {
    setConfirmDelete(id); // opens confirm modal
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteListing(confirmDelete);
            setListings((prev) => prev.filter((l) => l._id !== confirmDelete));
            setToast({ message: 'Listing deleted successfully', type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to delete listing', type: 'error' });
        } finally {
            setConfirmDelete(null);
            setTimeout(() => setToast(null), 3000); // auto dismiss after 3s
        }
    };

    if (loading) return <LoadingScreen />;

    if (error) return (
        <div className="error-message full-page">
            <h2>{error.message}</h2>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );

    return (
        <div className="seller-dashboard">
            <Navbar role="seller" name={sellerName} />

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div className="header-left">
                        <h1>My Listings</h1>
                        <p className="subtitle">{listings.length} listing{listings.length !== 1 ? 's' : ''} found</p>
                    </div>
                </div>

                {listings.length === 0 ? (
                    <div className="no-results">
                        <span className="no-results-icon">📦</span>
                        <p>No listings yet</p>
                        <small>Create your first listing to get started</small>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {listings.map((listing, index) => (
                            <div
                                key={listing._id}
                                className="listing-card"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                {/* Image */}
                                <div className="listing-card-image">
                                    {listing.image_urls?.[0] ? (
                                        <img src={listing.image_urls[0]} alt={listing.title} />
                                    ) : (
                                        <div className="listing-card-placeholder">📷</div>
                                    )}
                                    <span className={`status-badge badge-${listing.is_active ? 'active' : 'inactive'}`}>
                                        {listing.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="listing-card-info">
                                    <h3 className="listing-card-title">{listing.title}</h3>
                                    <p className="listing-card-description">{listing.description}</p>

                                    <div className="listing-card-meta">
                                        <span className="listing-price">${listing.price?.toFixed(2)}</span>
                                        <span className="listing-stock">{listing.countInStock} in stock</span>
                                        <span className="listing-delivery">🚚 {listing.delivery_days} days</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="listing-card-actions">
                                    <button
                                        className="action-btn btn-view"
                                        onClick={() => navigate(`/seller/listings/${listing._id}`)}
                                    >
                                        View / Edit
                                    </button>
                                    <button
                                        className="action-btn btn-delete"
                                        onClick={() => handleDeleteClick(listing._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="update-status-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Delete Listing</h2>
                            <button className="close-btn" onClick={() => setConfirmDelete(null)}>✕</button>
                        </div>
                        <div className="modal-content">
                            <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                                <button className="btn-save" style={{ background: '#c7314d', borderColor: '#c7314d' }} onClick={handleDeleteConfirm}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}