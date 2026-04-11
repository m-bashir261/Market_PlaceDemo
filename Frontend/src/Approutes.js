import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderView from "./Views/Seller/OrderView";
import ProductDetail from './Views/Buyer/ProductDetail';

function BlankPage() {
  return <div style={{ minHeight: '100vh' }} />;
}

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/buyer/home" element={<BlankPage />} />
                <Route path="/buyer/product/:id" element={<ProductDetail />} />
                <Route path="/" element={<OrderView />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
