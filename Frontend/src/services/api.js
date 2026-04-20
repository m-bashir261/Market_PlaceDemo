async function fetchProducts({ 
    page = 1, 
    category = 'ALL', 
    limit = 10, 
    priceRange = 'ALL', 
    minRating = 0 
} = {}) {
    const params = new URLSearchParams({
        page,
        category,
        limit,
        priceRange,
        minRating
    });
    const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
    return response.json();
}

async function fetchCategories() {
    const response = await fetch("http://localhost:5000/api/products/categories");
    return response.json();
}

export { fetchCategories };
export default fetchProducts;