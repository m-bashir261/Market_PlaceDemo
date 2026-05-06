import axios from 'axios';

// Set your base URL. Adjust the port if your backend runs on something other than 5000.
const API_BASE_URL = 'http://localhost:5000/api';

export const getIncomingOrders = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log("Fetching incoming orders with token:", token);
        const response = await axios.get(`${API_BASE_URL}/orders/incoming`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching incoming orders:", error.response?.data || error.message);
        throw error;
    }
};


export const updateOrderStatus = async (orderNumber, status) => {
    try {
        const token = localStorage.getItem('token');
        console.log(`Updating order ${orderNumber} to status "${status}" with token:`, token);
        const response = await axios.put(`${API_BASE_URL}/orders/${orderNumber}/status`, {
            status: status
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating order ${orderNumber}:`, error.response?.data || error.message);
        throw error;
    }
};


export const getSellerListings = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log("Fetching seller listings with token:", token);
        const response = await axios.get(`${API_BASE_URL}/listings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching seller listings:", error.response?.data || error.message);
        throw error;
    }
};

export const getSingleListing = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/listings/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching listing:", error.response?.data || error.message);
        throw error;
    }
};

export const updateListing = async (id, data) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/listings/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating listing:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteListing = async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getPublicSellerListings = async (username) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/listings/public/seller/${username}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching public seller listings:", error.response?.data || error.message);
        throw error;
    }
};