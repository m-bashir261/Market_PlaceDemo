import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleListing, updateListing } from "../../Apis/Seller";
import { getCategories } from "../../services/products";
import { getMe } from '../../Apis/authApi'; // New API call to fetch user info
import Navbar from "../Navbar/Navbar";
import LoadingScreen from "../Loading";
import "./Seller.css";

export default function ListingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [listing, setListing] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [toast, setToast] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});
    const [sellerName, setSellerName] = useState('');

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
        const fetchData = async () => {
            try {
                const [listingData, categoryData] = await Promise.all([
                    getSingleListing(id),
                    getCategories()
                ]);
                setListing(listingData);
                setCategories(categoryData);
                setFormData({
                    title: listingData.title,
                    description: listingData.description,
                    price: listingData.price,
                    delivery_days: listingData.delivery_days,
                    countInStock: listingData.countInStock,
                    category_id: listingData.category_id,
                    is_active: listingData.is_active,
                });
            } catch (err) {
                setError({ message: err.message });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        try {
            const updated = await updateListing(id, formData);
            setListing(updated.listing);
            setEditMode(false);
            showToast('Listing updated successfully', 'success');
        } catch (err) {
            showToast('Failed to update listing', 'error');
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
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
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/seller/listings')}>
                            ← Back to Listings
                        </button>
                        <h1>{editMode ? 'Edit Listing' : 'Listing Details'}</h1>
                        <p className="subtitle">{listing.title}</p>
                    </div>
                    <div className="header-right">
                        {editMode ? (
                            <>
                                <button className="btn-cancel" onClick={() => setEditMode(false)}>
                                    Cancel
                                </button>
                                <button className="btn-save" onClick={handleSave}>
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button className="create-listing-btn" onClick={() => setEditMode(true)}>
                                ✎ Edit Listing
                            </button>
                        )}
                    </div>
                </div>

                <div className="orders-card listing-detail-card">
                    {/* LEFT — Image */}
                    <div className="listing-detail-left">
                        {listing.image_urls?.[0] ? (
                            <img src={listing.image_urls[0]} alt={listing.title} className="listing-detail-img" />
                        ) : (
                            <div className="listing-card-placeholder listing-detail-img">📷</div>
                        )}
                        <span className={`status-badge badge-${(formData.is_active ? 'active' : 'inactive')}`}>
                            {formData.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* RIGHT — Fields */}
                    <div className="listing-detail-right">

                        <div className="detail-field">
                            <label>Title</label>
                            {editMode ? (
                                <input className="form-input" name="title" value={formData.title} onChange={handleChange} />
                            ) : (
                                <p>{listing.title}</p>
                            )}
                        </div>

                        <div className="detail-field">
                            <label>Description</label>
                            {editMode ? (
                                <textarea className="form-input" name="description" rows="4" value={formData.description} onChange={handleChange} />
                            ) : (
                                <p>{listing.description}</p>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="detail-field">
                                <label>Price ($)</label>
                                {editMode ? (
                                    <input className="form-input" name="price" type="number" value={formData.price} onChange={handleChange} />
                                ) : (
                                    <p>${listing.price?.toFixed(2)}</p>
                                )}
                            </div>
                            <div className="detail-field">
                                <label>Delivery Days</label>
                                {editMode ? (
                                    <input className="form-input" name="delivery_days" type="number" value={formData.delivery_days} onChange={handleChange} />
                                ) : (
                                    <p>{listing.delivery_days} days</p>
                                )}
                            </div>
                        </div>

                        <div className="detail-field">
                            <label>Stock Count</label>
                            {editMode ? (
                                <input className="form-input" name="countInStock" type="number" value={formData.countInStock} onChange={handleChange} />
                            ) : (
                                <p>{listing.countInStock} in stock</p>
                            )}
                        </div>

                        <div className="detail-field">
                            <label>Category</label>
                            {editMode ? (
                                <select className="form-input" name="category_id" value={formData.category_id} onChange={handleChange}>
                                    <option value="">-- Select a category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <p>{categories.find(c => c._id === listing.category_id)?.name || 'N/A'}</p>
                            )}
                        </div>

                        {editMode && (
                            <div className="detail-field">
                                <label>Status</label>
                                <button
                                    type="button"
                                    className={`status-toggle-btn ${formData.is_active ? 'toggle-active' : 'toggle-inactive'}`}
                                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                >
                                    {formData.is_active ? '✅ Active' : '❌ Inactive'}
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}
        </div>
    );
}