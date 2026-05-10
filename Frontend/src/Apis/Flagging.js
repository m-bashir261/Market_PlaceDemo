import axios from 'axios';

// Set your base URL. Adjust the port if your backend runs on something other than 5000.
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

export const flagBuyer = async (orderNumber) => {
    try {
        const token = localStorage.getItem('token');
        console.log(`Flagging buyer for order ${orderNumber} with token:`, token);
        const response = await axios.put(`${API_BASE_URL}/flags/${orderNumber}/flag-buyer`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error flagging buyer for order ${orderNumber}:`, error.response?.data || error.message);
        throw error;
    }
};

export const flagSeller = async (orderNumber) => {
    try {
        const token = localStorage.getItem('token');
        console.log(`Flagging seller for order ${orderNumber} with token:`, token);
        const response = await axios.put(`${API_BASE_URL}/flags/${orderNumber}/flag-seller`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error flagging seller for order ${orderNumber}:`, error.response?.data || error.message);
        throw error;
    }
};