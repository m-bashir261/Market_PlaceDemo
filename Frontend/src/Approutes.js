import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderView from "./Views/Seller/OrderView";
import ProductDetail from './Views/Buyer/ProductDetail';
import OrderHistory from './Views/Buyer/OrderHistory';

function BlankPage() {
  return <div style={{ minHeight: '100vh' }} />;
}

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/buyer/orders" element={<OrderHistory />} />
                <Route path="/buyer/product/:id" element={<ProductDetail />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
