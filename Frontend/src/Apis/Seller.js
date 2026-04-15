import axios from 'axios';

// Set your base URL. Adjust the port if your backend runs on something other than 5000.
const API_BASE_URL = 'http://localhost:5000/api/orders';


export const getIncomingOrders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/incoming`);
        return response.data;
    } catch (error) {
        console.error("Error fetching incoming orders:", error.response?.data || error.message);
        throw error;
    }
};


export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${orderId}/status`, {
            status: status
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating order ${orderId}:`, error.response?.data || error.message);
        throw error;
    }
};