import React, {useState, useEffect} from 'react';
import '../../Components/SellerDashboard/Dashboard.css';
import Sidebar from '../../Components/SellerDashboard/Sidebar';
import Statsbar from '../../Components/SellerDashboard/Statsbar';
import ListingPreview from '../../Components/SellerDashboard/ListingPreview';
import LoadingScreen from '../Loading';

import { getMe } from '../../Apis/authApi';
import { getSellerListings } from '../../Apis/Seller';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


export default function SellerDashboard() {
    const [sellerName, setSellerName] = useState('');
    const [error, setError] = useState(null);
    const [activeListings, setActiveListings] = useState(null);
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
                <ListingPreview />
            {/* rest of dashboard content */}
            </main>
        </div>
    );
}