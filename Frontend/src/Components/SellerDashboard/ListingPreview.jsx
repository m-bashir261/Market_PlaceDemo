import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellerListings } from '../../Apis/Seller';

const ListingPreview = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or 'table'
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await getSellerListings();
                const active = response
                    .filter(listing => listing.is_active === true)
                    .reverse() // Latest first (descending)
                    .slice(0, 5);
                setListings(active);
            } catch (err) {
                console.error('Failed to fetch listings:', err);
                setError('Could not load listings preview');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const handleViewAll = () => {
        navigate('/seller/listings');
    };

    if (error) {
        return <div className="listing-preview-error">{error}</div>;
    }

    // Check if there are no listings (even before loading completes)
    const hasNoListings = !loading && listings.length === 0;

    return (
        <div className="listing-preview-container">
            {!hasNoListings && (
                <div className="listing-preview-header">
                    <h3 className="listing-preview-title">Your Recent Listings</h3>
                    <div className="listing-preview-tabs">
                        <button
                            className={`listing-preview-tab ${viewMode === 'gallery' ? 'active' : ''}`}
                            onClick={() => setViewMode('gallery')}
                        >
                            Gallery
                        </button>
                        <button
                            className={`listing-preview-tab ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            List
                        </button>
                    </div>
                </div>
            )}

            {hasNoListings ? (
                <div className="listing-preview-empty listing-preview-empty--full">
                    <div className="listing-preview-empty-content">
                        <h3>No Active Listings Yet</h3>
                        <p>Create your first listing to get started!</p>
                        <button
                            className="listing-preview-empty-btn"
                            onClick={() => navigate('/seller/listings/create')}
                        >
                            Create Listing
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {viewMode === 'gallery' ? (
                        // OPTION 2: GALLERY VIEW
                        <div className="listing-preview-gallery">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="listing-gallery-card listing-gallery-card--skeleton">
                                <div className="listing-gallery-card__images-skeleton"></div>
                                <div className="listing-gallery-card__info-skeleton"></div>
                                <div className="listing-gallery-card__price-skeleton"></div>
                            </div>
                        ))
                    ) : (
                        listings.map(listing => (
                            <div key={listing._id} className="listing-gallery-card">
                                <div className="listing-gallery-card__images">
                                    {listing.image_urls && listing.image_urls.slice(0, 3).map((img, idx) => (
                                        <div key={idx} className="listing-gallery-card__image-slot">
                                            <img src={img} alt={`${listing.title} ${idx + 1}`} />
                                        </div>
                                    ))}
                                    {(!listing.image_urls || listing.image_urls.length === 0) && (
                                        <div className="listing-gallery-card__image-slot">
                                            <img src="https://via.placeholder.com/150" alt="placeholder" />
                                        </div>
                                    )}
                                </div>
                                <div className="listing-gallery-card__info">
                                    <h4 className="listing-gallery-card__title">{listing.title}</h4>
                                    <p className="listing-gallery-card__desc">{listing.description?.substring(0, 40)}...</p>
                                    <div className="listing-gallery-card__stock">
                                        Stock: {listing.countInStock || 0}
                                    </div>
                                </div>
                                <div className="listing-gallery-card__price">
                                    LE{listing.price?.toFixed(2) || '0.00'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                // OPTION 3: TABLE VIEW
                <div className="listing-preview-table">
                    {loading ? (
                        <div className="listing-table-skeleton">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="listing-table-row--skeleton">
                                    <div className="listing-table-cell--skeleton"></div>
                                    <div className="listing-table-cell--skeleton"></div>
                                    <div className="listing-table-cell--skeleton"></div>
                                    <div className="listing-table-cell--skeleton"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="listing-table-wrapper">
                            <div className="listing-table-header">
                                <div className="listing-table-cell listing-table-cell--image">Image</div>
                                <div className="listing-table-cell listing-table-cell--title">Title</div>
                                <div className="listing-table-cell listing-table-cell--price">Price</div>
                                <div className="listing-table-cell listing-table-cell--stock">Stock</div>
                            </div>
                            {listings.map(listing => (
                                <div key={listing._id} className="listing-table-row">
                                    <div className="listing-table-cell listing-table-cell--image">
                                        <img
                                            src={listing.image_urls?.[0] || 'https://via.placeholder.com/50'}
                                            alt={listing.title}
                                            className="listing-table-image"
                                        />
                                    </div>
                                    <div className="listing-table-cell listing-table-cell--title">
                                        <span className="listing-table-title">{listing.title}</span>
                                    </div>
                                    <div className="listing-table-cell listing-table-cell--price">
                                        <span className="listing-table-price">LE{listing.price?.toFixed(2)}</span>
                                    </div>
                                    <div className="listing-table-cell listing-table-cell--stock">
                                        <span className={`listing-table-stock ${listing.countInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                            {listing.countInStock || 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
                </>
            )}

            {!hasNoListings && (
                <button className="listing-preview-btn" onClick={handleViewAll}>
                    View All Listings
                </button>
            )}
        </div>
    );
};

export default ListingPreview;
