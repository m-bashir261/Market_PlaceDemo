import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderView from "./Views/Seller/OrderView";
import CreateListings from "./Views/Seller/CreateListings";

function AppRoutes() {
    return (
        <Router>
            <Routes>
            <Route path="/" element={<OrderView />} />
            <Route path="/seller/listings/create" element={<CreateListings />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
