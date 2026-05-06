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

const uploadToCloudinary = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(
`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,    { method: 'POST', body: formData }
  )

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'Image upload failed')
  return data.secure_url
}

export default function CreateListing() {
  const [formData, setFormData] = useState({  //formData is an object holding everything in the form 
    title: '',
    description: '',
    price: '',
    delivery_days: '',
    category_id: '',
    stock: ''
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false) // success is a boolean that flips to true to track if listing creation was successful
  const [imageFiles, setImageFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const { categories, loading, error: categoryError } = useCategories() // this custom hook fetches the list of categories from the backend and manages loading and error states for that request.
  const [allRegions, setAllRegions] = useState([])
  const [selectedAreas, setSelectedAreas] = useState([]);
  // handleChange is a generic function that updates a component's state in real-time as a user types or selects a value in a form element
  // e typically refers to the Event Object. It is a standard naming convention for the first argument passed to an event handler function
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  } // this function takes the existing formData object, spreads its properties into a new object, and then updates the specific property that corresponds to the name of the input field that triggered the event with its current value. This allows for dynamic handling of multiple form fields without needing separate state variables or handlers for each one.




  useEffect(() => {
    // Fetch the reference table data
    fetch('http://localhost:5000/api/regions')
      .then(res => res.json())
      .then(data => setAllRegions(data));
  }, []);

  const toggleRegion = (regionName) => {
    setSelectedAreas(prev => {
      const exists = prev.find(area => area.region === regionName);
      if (exists) {
        // If it's already selected, remove it
        return prev.filter(area => area.region !== regionName);
      } else {
        // If newly selected, add it with a default fee of 0
        return [...prev, { region: regionName, fee: 0 }];
      }
    });
  };

  // Handle typing a custom fee for a selected region
  const handleFeeChange = (regionName, feeValue) => {
    setSelectedAreas(prev => 
      prev.map(area => 
        area.region === regionName 
          ? { ...area, fee: Number(feeValue) } 
          : area
      )
    );
  };


  
  const handleFileDrop = (e) => {
  e.preventDefault()
  const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  setImageFiles(prev => [...prev, ...dropped])
}

const handleFileSelect = (e) => {
  const selected = Array.from(e.target.files)
  setImageFiles(prev => [...prev, ...selected])
}

const removeFile = (index) => {
  setImageFiles(prev => prev.filter((_, i) => i !== index))
}


  const handleSubmit = async (e) => {
    e.preventDefault() // when the create listing button is clicked, this stops the browser from reloading the page (the default behavior for forms).
    setError(null)

    if (imageFiles.length === 0) {
  setError('Please add at least one image.')
  return }

    // We need to convert price and delivery_days to numbers, and split image_urls into an array before sending to the backend
    try {  // this block attempts to execute the code that creates the listing. If any error occurs during this process (like a network error or a server error), it will be caught by the catch block below, allowing us to handle it gracefully instead of crashing the application.
      setUploading(true)
      
      const imageUrls = await Promise.all(imageFiles.map(uploadToCloudinary))
      setUploading(false)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',   // sends the session cookie with the request
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          delivery_days: Number(formData.delivery_days),
          image_url: imageUrls,
          countInStock: Number(formData.stock), 
          serviceableAreas: selectedAreas
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      setSuccess(true)

    } catch (err) {

      setUploading(false)
      
      setError(err.message)
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
              stock: ''
            });
            setImageFiles([]);
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
              className="form-input" 
              name="title" 
              placeholder="e.g. Headset, Sewing Machine, etc."
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
            </div>

           <div className="form-group">
             <label>Images</label>
               <div className="drop-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}>
                  <p>Drag & drop images here</p>
                  <p className="drop-zone-or">or</p>
                    <input type="file" accept="image/*" multiple onChange={handleFileSelect} />
                </div>

              {imageFiles.length > 0 && (
              <div className="image-preview-grid">
                {imageFiles.map((file, i) => (
                  <div key={i} className="image-preview-item">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="image-preview-thumb" />
                    <button type="button" onClick={() => removeFile(i)} className="image-preview-remove">×</button>
                  </div>
                ))}
              </div>
              )}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                className="form-input" 
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
                  className="form-input" 
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
                  className="form-input" 
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
                className="form-input" 
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
                className="form-input" 
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
              <div style={{ marginBottom: '8px' }}>
                <label>Serviceable Areas & Shipping Fees</label>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Select the regions you deliver to and set your custom shipping cost for each.
                </p>
              </div>

              <div className="regions-grid">
                {allRegions.map(region => {
                  // Check if this region is currently selected
                  const selectedArea = selectedAreas.find(a => a.region === region);
                  const isSelected = !!selectedArea;

                  return (
                    <div key={region} className={`region-card ${isSelected ? 'selected' : ''}`}>
                      <label className="region-label">
                        <input 
                          type="checkbox" 
                          className="region-checkbox"
                          checked={isSelected}
                          onChange={() => toggleRegion(region)}
                        />
                        <span className="region-name">{region}</span>
                      </label>
                      
                      {/* Only show the fee input if the checkbox is checked */}
                      {isSelected && (
                        <div className="fee-input-wrapper">
                          <span className="currency-symbol">$</span>
                          <input 
                            type="number"
                            className="fee-input"
                            placeholder="0.00"
                            min="0"
                            // UX trick: if it's 0, show empty so they can type immediately
                            value={selectedArea.fee === 0 ? '' : selectedArea.fee} 
                            onChange={(e) => handleFeeChange(region, e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={uploading}>
                    {uploading ? 'Uploading images...' : 'Publish Listing'}
              </button>            
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}