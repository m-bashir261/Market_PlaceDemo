async function fetchProducts({page, category, limit, priceRange,minRating}) {
    const response = await fetch(`http://localhost:5000/api/products?page=${page}&category=${category}&limit=${limit}&priceRange=${priceRange}&minRating=${minRating}`)
    return response.json()
}
export default fetchProducts
async function fetchCategories() {
    const response = await fetch("http://localhost:5000/api/products/categories")
    return response.json()
}