import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderView from "./Views/Seller/OrderView";
import ProductDetail from './Views/Buyer/ProductDetail';
import OrderHistory from './Views/Buyer/OrderHistory';


import ProductCatalog from "./Views/Buyer/ProductCatalog";
import Signup from "./Views/Authentication/Signup";
import Login from "./Views/Authentication/Login";
import { Navigate } from 'react-router-dom';
import CreateListings from "./Views/Seller/CreateListings";

function AppRoutes() {
    return (
        <Router>
            <Routes>

                <Route path="/buyer/orders" element={<Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/orders" element={<OrderHistory />} />
                <Route path="/buyer/product/:id" element={<ProductDetail />} />
              <Route path="/products" element={<ProductCatalog />} />

            <Route path="/seller/listings/create" element={<CreateListings />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
