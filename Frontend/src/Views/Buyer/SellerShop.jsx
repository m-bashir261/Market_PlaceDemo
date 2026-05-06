import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { getPublicSellerListings, getSellerInfo } from '../../Apis/Seller';
import './SellerShop.css';

export default function SellerShop() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        console.log('Loading shop for username:', username);
        
        const loadShop = async () => {
            try {
                // Always fetch listings (required)
                const listingsData = await getPublicSellerListings(username);
                console.log('Listings data:', listingsData);
                if (!isMounted) return;
                setListings(listingsData);
                
                // Try to fetch seller info (optional - shop works without it)
                try {
                    console.log('Fetching seller info for:', username);
                    const infoData = await getSellerInfo(username);
                    console.log('Seller info response:', infoData);
                    if (isMounted) {
                        setSellerInfo(infoData);
                        console.log('Seller info set:', infoData);
                    }
                } catch (infoError) {
                    console.warn('Failed to load seller info, continuing without it:', infoError);
                    // Don't fail the whole page if seller info fails
                }
            } catch (error) {
                console.error('Shop loading error:', error);
                if (isMounted) setError('Could not load this shop.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        
        loadShop();
        
        return () => {
            isMounted = false;
        };
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
                        {sellerInfo && (
                            <div className="shop-seller-stats">
                                <span className="seller-rating">⭐ {sellerInfo.rating} ({sellerInfo.totalReviews} reviews)</span>
                                <span className="seller-flags">🚩 {sellerInfo.flags} flag{sellerInfo.flags !== 1 ? 's' : ''}</span>
                            </div>
                        )}
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