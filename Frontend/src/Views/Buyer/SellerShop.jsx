import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { getPublicSellerListings } from '../../Apis/Seller';
import './SellerShop.css';

export default function SellerShop() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getPublicSellerListings(username)
            .then(setListings)
            .catch(() => setError('Could not load this shop.'))
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) return (
        <div className="seller-shop-page">
            <Navbar />
            <main className="shop-body"><p className="shop-status">Loading shop...</p></main>
            <Footer />
        </div>
    );

    if (error) return (
        <div className="seller-shop-page">
            <Navbar />
            <main className="shop-body"><p className="shop-status">{error}</p></main>
            <Footer />
        </div>
    );

    return (
        <div className="seller-shop-page">
            <Navbar />
            <main className="shop-body">
                <div className="shop-header">
                    <div className="shop-avatar">{username.charAt(0).toUpperCase()}</div>
                    <div>
                        <h1 className="shop-username">{username}'s Shop</h1>
                        <p className="shop-count">{listings.length} active listing{listings.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {listings.length === 0 ? (
                    <p className="shop-status">This seller has no active listings right now.</p>
                ) : (
                    <div className="shop-grid">
                        {listings.map(listing => (
                            <div
                                key={listing._id}
                                className="shop-card"
                                onClick={() => navigate(`/buyer/product/${listing._id}`)}
                            >
                                <div className="shop-card-image">
                                    {listing.image_urls?.[0]
                                        ? <img src={listing.image_urls[0]} alt={listing.title} />
                                        : <div className="shop-card-placeholder">📷</div>
                                    }
                                </div>
                                <div className="shop-card-info">
                                    <h3 className="shop-card-title">{listing.title}</h3>
                                    <p className="shop-card-desc">{listing.description}</p>
                                    <span className="shop-card-price">${listing.price?.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}