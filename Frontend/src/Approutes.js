import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderView from "./Views/Seller/OrderView";
import ProductCatalog from "./Views/Buyer/ProductCatalog";

function AppRoutes() {
    return (
        <Router>
            <Routes>
            <Route path="/" element={<OrderView />} />
            <Route path="/products" element={<ProductCatalog />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
