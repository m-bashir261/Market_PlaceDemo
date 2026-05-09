import axios from "axios"
const API_BASE_URL = "http://localhost:5000/api/products"

export const getProducts = async ({page, category, limit, priceRange, minRating, search, seller}) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page);
    if (category !== undefined) params.append('category', category);
    if (limit !== undefined) params.append('limit', limit);
    if (priceRange !== undefined) params.append('priceRange', priceRange);
    if (minRating !== undefined) params.append('minRating', minRating);
    if (search !== undefined) params.append('search', search);
    if (seller !== undefined && seller !== 'ALL' && seller !== '') params.append('seller', seller);

    const response = await axios.get(`${API_BASE_URL}?${params.toString()}`);
    return response.data;
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

export const getReviews = async (listingId) => {
    const response = await axios.get(`http://localhost:5000/api/reviews/listing/${listingId}`)
    return response.data
}
