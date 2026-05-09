import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SellerDashboard  from "./Views/Seller/SellerDashboard";
import OrderView from "./Views/Seller/OrderView";
import CreateListings from "./Views/Seller/CreateListings";
import Listings from "./Views/Seller/Listings";
import ListingDetail from "./Views/Seller/ListingDetail";

import ProductDetail from './Views/Buyer/ProductDetail';
import OrderHistory from './Views/Buyer/OrderHistory';
import Checkout from './Views/Buyer/Checkout';
import ProtectedRoute from './services/ProtectedRoute';
import ProductCatalog from "./Views/Buyer/ProductCatalog";
import SellerShop from './Views/Buyer/SellerShop';
import Wishlist from './Views/Buyer/Wishlist';
import Home from "./Views/Buyer/Home";
import AddressBook from './Views/Buyer/AddressBook';
import Signup from "./Views/Authentication/Signup";
import Login from "./Views/Authentication/Login";
import { Navigate } from 'react-router-dom';

function AppRoutes() {
    return (
        <Router>
            <Routes>
            <Route path="/buyer/orders" element={<Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/seller/dashboard" element={<ProtectedRoute allowedRole="seller"><SellerDashboard /></ProtectedRoute>} />
            <Route path="/seller/orders" element={<ProtectedRoute allowedRole="seller"><OrderView /></ProtectedRoute>} />
            <Route path="/seller/listings" element={<ProtectedRoute allowedRole="seller"><Listings /></ProtectedRoute>} />
            <Route path="/seller/listings/create" element={<ProtectedRoute allowedRole="seller"><CreateListings /></ProtectedRoute>} />
            <Route path="/seller/listings/:id" element={<ProtectedRoute allowedRole="seller"><ListingDetail /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/orders" element={<ProtectedRoute allowedRole="buyer"><OrderHistory /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute allowedRole="buyer"><Checkout /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute allowedRole="buyer"><Wishlist /></ProtectedRoute>} />
            <Route path="/addresses" element={<ProtectedRoute allowedRole="buyer"><AddressBook /></ProtectedRoute>} />
            <Route path="/buyer/product/:id" element={<ProductDetail />} />
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/shop/:username" element={<SellerShop />} />
            {/* <Route path="/unauthorized" element={<Navigate to="/login" replace />} /> */}

            </Routes>
        </Router>
    );
}

export default AppRoutes;
