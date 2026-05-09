import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/addresses';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getAddresses = async () => {
    const response = await axios.get(API_BASE_URL, getHeaders());
    return response.data;
};

export const addAddress = async (addressData) => {
    const response = await axios.post(API_BASE_URL, addressData, getHeaders());
    return response.data;
};

export const updateAddress = async (id, addressData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, addressData, getHeaders());
    return response.data;
};

export const deleteAddress = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, getHeaders());
    return response.data;
};
