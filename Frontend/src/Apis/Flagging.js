import axios from 'axios';

// Set your base URL. Adjust the port if your backend runs on something other than 5000.
const API_BASE_URL = 'http://localhost:5000/api';

export const flagBuyer = async (orderNumber, flag) => {
    try {
        const token = localStorage.getItem('token');
        console.log(`Flagging buyer for order ${orderNumber} as "${flag}" with token:`, token);
        const response = await axios.put(`${API_BASE_URL}/flags/${orderNumber}/flag-buyer`, {
            flag: flag
        }, {
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

export const flagSeller = async (orderNumber, flag) => {
    try {
        const token = localStorage.getItem('token');
        console.log(`Flagging seller for order ${orderNumber} as "${flag}" with token:`, token);
        const response = await axios.put(`${API_BASE_URL}/flags/${orderNumber}/flag-seller`, {
            flag: flag
        }, {
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