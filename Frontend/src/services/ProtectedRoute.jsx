import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // 1. If no token, they aren't logged in
    if (!token) {
        console.log("No token found, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    // 2. Optional: Check if they have the right role (e.g., Buyer vs Seller)
    console.log(`Checking role: userRole="${userRole}", allowedRole="${allowedRole}"`);
    if (allowedRole && userRole !== allowedRole) {
        console.log(`User role "${userRole}" does not match required role "${allowedRole}", redirecting to unauthorized`);
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;