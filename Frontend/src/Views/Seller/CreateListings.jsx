import { useState } from 'react'
import './Seller.css';

export default function CreateListing() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    delivery_days: '',
    category_id: '',
    image_urls: ''   // we'll take a comma-separated string and split it later
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
 
    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',   // sends the session cookie with the request
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          delivery_days: Number(formData.delivery_days),
          image_urls: formData.image_urls.split(',').map(url => url.trim())
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
    return <p>Listing created successfully!</p>
  }

  return (
    <div>
      <h1>Create a Listing</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>Title</label>
        <input name="title" value={formData.title} onChange={handleChange} />
      </div>

      <div>
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} />
      </div>

      <div>
        <label>Price</label>
        <input name="price" type="number" value={formData.price} onChange={handleChange} />
      </div> 

      <div>
        <label>Delivery Days</label>
        <input name="delivery_days" type="number" value={formData.delivery_days} onChange={handleChange} />
      </div>

      <div>
        <label>Category ID</label>
        <input name="category_id" value={formData.category_id} onChange={handleChange} />
      </div>

      <div>
        <label>Image URLs (comma separated)</label>
        <input name="image_urls" value={formData.image_urls} onChange={handleChange} />
      </div>

      <button onClick={handleSubmit}>Create Listing</button>
    </div>
  )
}