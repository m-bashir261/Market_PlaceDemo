import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderView from "./Views/Seller/OrderView";
import CreateListings from "./Views/Seller/CreateListings";
import Listings from "./Views/Seller/Listings";
import ListingDetail from "./Views/Seller/ListingDetail";

import ProductDetail from './Views/Buyer/ProductDetail';
import OrderHistory from './Views/Buyer/OrderHistory';
import Checkout from './Views/Buyer/Checkout';
import ProtectedRoute from './services/ProtectedRoute';
import ProductCatalog from "./Views/Buyer/ProductCatalog";

import ProtectedRoute from './services/ProtectedRoute';

import Home from "./Views/Buyer/Home";
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
            <Route path="/seller/orders" element={<ProtectedRoute allowedRole="seller"><OrderView /></ProtectedRoute>} />
            <Route path="/seller/listings" element={<ProtectedRoute allowedRole="seller"><Listings /></ProtectedRoute>} />
            <Route path="/seller/listings/:id" element={<ProtectedRoute allowedRole="seller"><ListingDetail /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/orders" element={<ProtectedRoute allowedRole="buyer"><OrderHistory /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute allowedRole="buyer"><Checkout /></ProtectedRoute>} />
            <Route path="/buyer/product/:id" element={<ProductDetail />} />
            <Route path="/products" element={<ProductCatalog />} />
            {/* <Route path="/unauthorized" element={<Navigate to="/login" replace />} /> */}

            <Route path="/seller/listings/create" element={<ProtectedRoute allowedRole="seller"><CreateListings /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
