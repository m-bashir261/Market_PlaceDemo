import { Link   }  from 'react-router-dom';
import { useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Seller.css';
import ListingComp from '../../assets/ListingComp.lottie';
import { getCategories } from '../../services/products';
import { useEffect } from 'react';

const useCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const categories = await getCategories();
          setCategories(categories);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    }, []);
    return { categories, loading, error }
  }

export default function CreateListing() {
  const [formData, setFormData] = useState({  //formData is an object holding everything in the form 
    title: '',
    description: '',
    price: '',
    delivery_days: '',
    category_id: '',
    image_url: '',   // we'll take a comma-separated string and split it later
    stock: ''
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false) // success is a boolean that flips to true to track if listing creation was successful
  const { categories, loading, error: categoryError } = useCategories() // this custom hook fetches the list of categories from the backend and manages loading and error states for that request.

  // handleChange is a generic function that updates a component's state in real-time as a user types or selects a value in a form element
  // e typically refers to the Event Object. It is a standard naming convention for the first argument passed to an event handler function
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  } // this function takes the existing formData object, spreads its properties into a new object, and then updates the specific property that corresponds to the name of the input field that triggered the event with its current value. This allows for dynamic handling of multiple form fields without needing separate state variables or handlers for each one.

  const handleSubmit = async (e) => {
    e.preventDefault() // when the create listing button is clicked, this stops the browser from reloading the page (the default behavior for forms).
    setError(null)

    // We need to convert price and delivery_days to numbers, and split image_urls into an array before sending to the backend
    try {  // this block attempts to execute the code that creates the listing. If any error occurs during this process (like a network error or a server error), it will be caught by the catch block below, allowing us to handle it gracefully instead of crashing the application.
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',   // sends the session cookie with the request
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          delivery_days: Number(formData.delivery_days),
          image_url: formData.image_url.split(',').map(url => url.trim()),
          countInStock: Number(formData.stock)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      setSuccess(true)

    } catch (err) {
      setError('Could not connect to server')
    }
  }

  if (success) {
    return (
  <div className="success-overlay">
    <div className="success-card">
      {/* 1. Lottie Animation */}
      <div className="success-animation-container">
        <DotLottieReact 
          src={ListingComp} 
          autoplay 
          loop={false} 
        />
      </div>

      {/* 2. Text Content */}
      <h2>Listing Created!</h2>
      <p>Your item is now live and visible to customers.</p>

      {/* 3. The missing Action Wrapper - Critical for the row layout */}
      <div className="success-actions">
        <Link to="/seller/orders" className="btn-primary">
          Go to Seller Hub
        </Link>
        
        <button 
          className="btn-secondary"
          onClick={() => {
            setSuccess(false); 
            setFormData({
              title: '',
              description: '',
              price: '',
              delivery_days: '',
              category_id: '',
              image_url: '',
              stock: ''
            });
          }}
        >
          Create Another
        </button>
      </div>
    </div>
  </div>
);
  }

  return (
    <div className="seller-dashboard">
      {/* Reusing header style */}
      <header className="seller-header">
      <Link to="/seller/orders" className="seller-hub-link">
        <div className="seller-badge">
          <span className="badge-icon">📦</span>
          <span className="seller-label">SELLER HUB</span>
        </div>
      </Link>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Create a New Listing</h1>
            <p className="subtitle">Fill in the details to list your service or product.</p>
          </div>
        </div>

        <div className="orders-card"> {/* Reusing  card container */}
          <div className="card-header">
            <h2>Listing Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="listing-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Title</label>
              <input 
                className="search-input" 
                name="title" 
                placeholder="e.g. Headset, Sewing Machine, etc."
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                className="search-input" 
                name="description" 
                rows="4"
                placeholder="Describe what you are offering..."
                value={formData.description} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price ($)</label>
                <input 
                  className="search-input" 
                  name="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Delivery Days</label>
                <input 
                  className="search-input" 
                  name="delivery_days" 
                  type="number" 
                  value={formData.delivery_days} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Stock Count</label>
              <input 
                className="search-input" 
                name="stock" 
                type="number" 
                value={formData.stock} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                className="search-input" 
                name="category_id" 
                value={formData.category_id} 
                onChange={handleChange} 
                required
              >
                <option value=""> -- Select a category -- </option>
                {categories.map((category) => (<option key={category._id} value={category._id}>{category.name}</option>))}
              </select>
            </div>

            <div className="form-group">
              <label>Image URLs (comma separated)</label>
              <input 
                className="search-input" 
                name="image_url" 
                placeholder="http://site.com/img1.jpg, http://site.com/img2.jpg"
                value={formData.image_url} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">Publish Listing</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}