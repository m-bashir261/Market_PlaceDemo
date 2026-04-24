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