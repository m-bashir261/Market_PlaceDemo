import axios from "axios"
const API_BASE_URL = "http://localhost:5000/api/products"

export const getProducts = async ({page, category, limit, priceRange, minRating, search}) => {
    const response = await axios.get(`${API_BASE_URL}?page=${page}&category=${category}&limit=${limit}&priceRange=${priceRange}&minRating=${minRating}&search=${search}`)
    return response.data
}

export const getCategories = async () => {
    const response = await axios.get(`${API_BASE_URL}/categories`)
    return response.data
}

export const getProductById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`)
    return response.data
}

export const getComments = async (productId) => {
    const response = await axios.get(`${API_BASE_URL}/${productId}/comments`)
    return response.data
}

export const addComment = async (productId, text, token) => {
    const response = await axios.post(`${API_BASE_URL}/${productId}/comments`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export const likeComment = async (productId, commentId, token) => {
    const response = await axios.post(`${API_BASE_URL}/${productId}/comments/${commentId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export const replyToComment = async (productId, commentId, text, token) => {
    const response = await axios.post(`${API_BASE_URL}/${productId}/comments/${commentId}/reply`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}