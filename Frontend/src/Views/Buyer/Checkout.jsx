import { useLocationContext } from '../../context/LocationContext';
import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { Store, ShoppingCart, Trash2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAddresses, addAddress } from '../../services/addressService';
import './Checkout.css';



const Checkout = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1); // Step 1: Cart, Step 2: Details, Step 3: Review
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddressForLater, setSaveAddressForLater] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const { location } = useLocationContext();


  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    building: '',
    floor: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Egypt'
  });

  const applySavedLocation = () => {
      if (!location) return;
      setShippingDetails(prev => ({
          ...prev,
          addressLine1: location.addressLine1 || prev.addressLine1,
          city: location.city || prev.city,
          state: location.state || prev.state,
          postalCode: location.postalCode || prev.postalCode,
          country: location.country || prev.country,
          // leave building, floor, apartment as they are (manual entry)
      }));
  };


  useEffect(() => {
      if (step === 2) {
          if (location && !shippingDetails.addressLine1 && !shippingDetails.city) {
              applySavedLocation();
          }
          fetchSavedAddresses();
      }
  }, [step]);

  const fetchSavedAddresses = async () => {
      try {
          const data = await getAddresses();
          setSavedAddresses(data);
          // If user has a default address, auto-apply it
          const defaultAddr = data.find(a => a.isDefault);
          if (defaultAddr && !shippingDetails.firstName) {
              applySavedAddress(defaultAddr);
          }
      } catch (err) {
          console.error("Failed to fetch addresses", err);
      }
  };

  const applySavedAddress = (addr) => {
      setShippingDetails({
          firstName: addr.firstName,
          lastName: addr.lastName,
          email: addr.email,
          phone: addr.phone,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2 || '',
          building: addr.building || '',
          floor: addr.floor || '',
          apartment: addr.apartment || '',
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode || '',
          country: addr.country || 'Egypt'
      });
  };

  // 1. Group items by seller
  const groupedItems = cartItems.reduce((acc, item) => {
    const sellerId = item.seller_id;
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.seller,
        seller_id: item.seller_id,
        items: [],
        total: 0
      };
    }
    acc[sellerId].items.push(item);
    acc[sellerId].total += (item.price * item.quantity);
    return acc;
  }, {});

  // 2. Calculate the overlapping regions for everything in the cart
  const availableCartRegions = React.useMemo(() => {
    if (!cartItems || cartItems.length === 0) return [];
    
    const itemRegionNames = cartItems.map(item => 
      (item.serviceableAreas || []).map(area => area.region)
    );
    
    return itemRegionNames.reduce((commonRegions, currentItemRegions) => {
      return commonRegions.filter(region => currentItemRegions.includes(region));
    });
  }, [cartItems]);

  // 3. Calculate Subtotal (MUST be before Total)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 4. Calculate dynamic shipping cost (MUST be before Total)
  const shippingCost = React.useMemo(() => {
    if (!shippingDetails.city) return 0;

    return cartItems.reduce((totalShipping, item) => {
      const areaRule = item.serviceableAreas?.find(
        area => area.region === shippingDetails.city
      );
      const itemShippingFee = areaRule ? areaRule.fee : 0;
      return totalShipping + (itemShippingFee * item.quantity);
    }, 0);
  }, [cartItems, shippingDetails.city]);

  // 5. Calculate Total (Now that subtotal and shippingCost exist, this is safe!)
  const total = subtotal + shippingCost;

  const validateForm = () => {
    const errors = {};
    if (!shippingDetails.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingDetails.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingDetails.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingDetails.email)) errors.email = 'Please enter a valid email address';
    if (!shippingDetails.phone.trim()) errors.phone = 'Phone number is required';
    if (!/^\d{8,}$/.test(shippingDetails.phone.replace(/[\s\-\(\)\+]/g, ''))) {
      errors.phone = 'Enter a valid phone number (at least 8 digits)';
    }
    if (!shippingDetails.addressLine1.trim()) errors.addressLine1 = 'Street address is required';
    if (!shippingDetails.city.trim()) errors.city = 'City is required';
    if (!shippingDetails.state.trim()) errors.state = 'District/State is required';
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please correct the errors in the form');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleContinueToDetails = () => {
    setStep(2);
  };

  const handleContinueToReview = () => {
    if (validateForm()) {
      if (saveAddressForLater) {
          // Fire and forget
          addAddress({ ...shippingDetails, title: `Address ${savedAddresses.length + 1}` }).catch(e => console.error(e));
      }
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.warning('Please log in to place an order');
        setLoading(false);
        return;
      }

      console.log('Token being used:', token ? 'Present' : 'Missing');
      console.log('Token length:', token?.length);

      const orderPromises = Object.values(groupedItems).map(async (group) => {
        const orderItems = group.items.map(i => ({
          listing_id: i.listing_id,
          quantity: i.quantity,
          price: i.price
        }));

        const orderPayload = {
          seller_id: group.seller_id,
          items: orderItems,
          totalAmount: group.total + 5, // item total + shipping
          shippingDetails: shippingDetails
        };

        console.log('Sending order for seller:', group.seller);
        console.log('Order payload:', orderPayload);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server error response:', errorData);
          const errorMsg = errorData.details || errorData.message || `Failed to place order for ${group.seller}`;
          throw new Error(errorMsg);
        }

        const orderData = await response.json();
        console.log(`Order placed successfully for ${group.seller}:`, orderData);
        return orderData;
      });

      const results = await Promise.all(orderPromises);
      
      clearCart();
      toast.success('Orders placed successfully!');
      navigate('/orders');
    } catch (err) {
      console.error('Order placement error:', err);
      toast.error(`Error: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">
          {step === 1 ? (
            // STEP 1: Cart Review Only
            <>
              <header className="checkout-header">
                <h1 className="checkout-title">Your Cart</h1>
                <p className="text-secondary">Review your items before proceeding to checkout.</p>
              </header>

              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={48} className="empty-icon" />
                  <h2>Your cart is empty</h2>
                  <p>Looks like you haven't added anything yet.</p>
                  <button className="confirm-order-btn" onClick={() => navigate('/products')} style={{ maxWidth: '250px', margin: '20px auto 0' }}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="checkout-content">
                  <div className="checkout-items-wrapper">
                    {/* Order Items by Seller */}
                    {Object.values(groupedItems).map((group) => (
                      <div key={group.seller_id} className="seller-group">

                        {group.items.map(item => (
                          <div key={item.listing_id} className="checkout-item">
                            <img src={item.image} alt={item.name} className="checkout-item-img" />
                            <div className="checkout-item-info">
                              <h3 className="checkout-item-name">{item.name}</h3>
                              <div className="checkout-item-meta">
                                Qty: {item.quantity}
                              </div>
                              <div className="checkout-item-price">{(item.price * item.quantity).toFixed(2)} LE</div>
                            </div>
                            <button className="remove-btn" onClick={() => removeFromCart(item.listing_id)}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                        <div className="summary-row mt-3 pt-3" style={{ borderTop: '1px solid var(--co-border)' }}>
                          <span>Seller Subtotal:</span>
                          <strong>{group.total.toFixed(2)} LE</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-sidebar">
                    <div className="checkout-summary">
                      <h2 className="summary-title">Order Summary</h2>
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{subtotal.toFixed(2)} LE</span>
                      </div>
                      <div className="summary-row">
                      <span>Shipping {shippingDetails.city ? `to ${shippingDetails.city}` : ''}</span>
                      <span>
                        {shippingDetails.city 
                          ? `${shippingCost.toFixed(2)} LE` 
                          : 'Calculated at checkout'}
                      </span>
                    </div>
                      <div className="summary-total">
                        <span>Total</span>
                        <span>{total.toFixed(2)} LE</span>
                      </div>

                      <button
                        className="confirm-order-btn"
                        onClick={handleContinueToDetails}
                      >
                        Confirm Order
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : step === 2 ? (
            // STEP 2: Enter Details
            <>
              <header className="checkout-header">
                <button className="back-btn" onClick={() => setStep(1)}>
                  <ChevronLeft size={20} /> Back
                </button>
                <h1 className="checkout-title">Delivery Address</h1>
                
                <div className="address-quick-actions" style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {location && (
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={applySavedLocation}
                            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--co-surface)', border: '1.5px solid var(--co-border)', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            📍 Use Map Location
                        </button>
                    )}

                    {savedAddresses.length > 0 && (
                        <div className="saved-addresses-dropdown" style={{ position: 'relative' }}>
                            <select 
                                onChange={(e) => {
                                    const addr = savedAddresses.find(a => a._id === e.target.value);
                                    if (addr) applySavedAddress(addr);
                                }}
                                style={{ padding: '10px 16px', borderRadius: '8px', border: '1.5px solid var(--co-primary)', background: 'var(--co-surface)', color: 'var(--co-text)', fontWeight: '600' }}
                            >
                                <option value="">📋 Use a saved address</option>
                                {savedAddresses.map(addr => (
                                    <option key={addr._id} value={addr._id}>
                                        {addr.title} - {addr.addressLine1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <p className="text-secondary">Enter your delivery details to continue.</p>
              </header>

              <div className="checkout-content">
                <div className="checkout-items-wrapper">
                  {/* Shipping Details Form */}
                  <div className="shipping-details-section">
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={shippingDetails.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          className={formErrors.firstName ? 'input-error' : ''}
                        />
                        {formErrors.firstName && <span className="error-text">{formErrors.firstName}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={shippingDetails.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          className={formErrors.lastName ? 'input-error' : ''}
                        />
                        {formErrors.lastName && <span className="error-text">{formErrors.lastName}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={shippingDetails.email}
                          onChange={handleInputChange}
                          placeholder="ahmed.ali@example.com"
                          className={formErrors.email ? 'input-error' : ''}
                        />
                        {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={shippingDetails.phone}
                          onChange={handleInputChange}
                          placeholder="010 1234 5678"
                          className={formErrors.phone ? 'input-error' : ''}
                        />
                        {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                      </div>
                      <div className="form-group full-width">
                        <label htmlFor="addressLine1">Street Address *</label>
                        <input
                          type="text"
                          id="addressLine1"
                          name="addressLine1"
                          value={shippingDetails.addressLine1}
                          onChange={handleInputChange}
                          placeholder="90th Street"
                          className={formErrors.addressLine1 ? 'input-error' : ''}
                        />
                        {formErrors.addressLine1 && <span className="error-text">{formErrors.addressLine1}</span>}
                      </div>
                      <div className="form-group full-width">
                        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px'}}>
                          <div className="form-group">
                            <label htmlFor="building">Building Name/No.</label>
                            <input
                              type="text"
                              id="building"
                              name="building"
                              value={shippingDetails.building}
                              onChange={handleInputChange}
                              placeholder="Galleria Moon Valley"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="floor">Floor</label>
                            <input
                              type="text"
                              id="floor"
                              name="floor"
                              value={shippingDetails.floor}
                              onChange={handleInputChange}
                              placeholder="3"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="apartment">Apartment</label>
                            <input
                              type="text"
                              id="apartment"
                              name="apartment"
                              value={shippingDetails.apartment}
                              onChange={handleInputChange}
                              placeholder="302"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label htmlFor="addressLine2">Landmark (Optional)</label>
                        <input
                          type="text"
                          id="addressLine2"
                          name="addressLine2"
                          value={shippingDetails.addressLine2}
                          onChange={handleInputChange}
                          placeholder="Near Point 90 Mall"
                        />
                      </div>
                      <div className="form-group">
                      <label htmlFor="city">City *</label>
                      {availableCartRegions.length === 0 ? (
                        <span className="error-text">
                          Error: The items in your cart do not share a common delivery zone. 
                          Please remove some items or order them separately.
                        </span>
                      ) : (
                        <select
                          id="city"
                          name="city"
                          value={shippingDetails.city}
                          onChange={handleInputChange}
                          className={`form-input ${formErrors.city ? 'input-error' : ''}`}
                        >
                          <option value="">-- Select a City --</option>
                          {availableCartRegions.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      )}
                      {formErrors.city ? null : (
                            location?.city && !availableCartRegions.includes(location.city) && shippingDetails.city === location.city && (
                                <small className="error-text" style={{ color: '#f59e0b' }}>
                                    ⚠️ Your saved city "{location.city}" is not deliverable for all items in your cart. Please choose a compatible city.
                                </small>
                            )
                        )}
                    </div>
                      <div className="form-group">
                        <label htmlFor="state">District/State *</label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={shippingDetails.state}
                          onChange={handleInputChange}
                          placeholder="Cairo"
                          className={formErrors.state ? 'input-error' : ''}
                        />
                        {formErrors.state && <span className="error-text">{formErrors.state}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="postalCode">Postal Code (Optional)</label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={shippingDetails.postalCode}
                          onChange={handleInputChange}
                          placeholder="11835"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="country">Country *</label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={shippingDetails.country}
                          onChange={handleInputChange}
                          placeholder="Egypt"
                        />
                      </div>
                      <div className="form-group full-width" style={{ marginTop: '10px' }}>
                          <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--co-text-secondary)' }}>
                              <input 
                                  type="checkbox" 
                                  checked={saveAddressForLater}
                                  onChange={(e) => setSaveAddressForLater(e.target.checked)}
                                  style={{ width: '18px', height: '18px' }}
                              />
                              Save this address for future purchases
                          </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="checkout-sidebar">
                  <div className="checkout-summary">
                    <h2 className="summary-title">Order Summary</h2>
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>{subtotal.toFixed(2)} LE</span>
                    </div>
                    <div className="summary-row">
                    <span>Shipping {shippingDetails.city ? `to ${shippingDetails.city}` : ''}</span>
                    <span>
                      {shippingDetails.city 
                        ? `${shippingCost.toFixed(2)} LE` 
                        : 'Calculated at checkout'}
                    </span>
                  </div>
                    <div className="summary-total">
                      <span>Total</span>
                      <span>{total.toFixed(2)} LE</span>
                    </div>

                    <button
                      className="confirm-order-btn"
                      onClick={handleContinueToReview}
                    >
                      Place Order
                    </button>


                  </div>
                </div>
              </div>
            </>
          ) : (
            // STEP 3: Review & Checkout
            <>
              <header className="checkout-header">
                <button className="back-btn" onClick={() => setStep(2)}>
                  <ChevronLeft size={20} /> Back
                </button>
                <h1 className="checkout-title">Review Your Order</h1>
                <p className="text-secondary">Please verify your details before placing your order.</p>
              </header>

              <div className="checkout-content review-layout">
                <div className="checkout-items-wrapper">
                  {/* Delivery Details Review */}
                  <div className="review-section">
                    <div className="section-header">
                      <h2 className="section-title">Delivery Details</h2>
                      <button className="edit-btn" onClick={() => setStep(2)}>Edit</button>
                    </div>
                    <div className="review-details-card">
                      <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{shippingDetails.firstName} {shippingDetails.lastName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{shippingDetails.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{shippingDetails.phone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">
                          {shippingDetails.building && <>{shippingDetails.building}, </>}
                          {shippingDetails.floor && <>Floor {shippingDetails.floor}, </>}
                          {shippingDetails.apartment && <>Apt {shippingDetails.apartment}, </>}
                          {shippingDetails.addressLine1}
                          {shippingDetails.addressLine2 && <>, {shippingDetails.addressLine2}</>}
                          <br />{shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
                          <br />{shippingDetails.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Review */}
                  <div className="review-section">
                    <h2 className="section-title">Order Items</h2>
                    {Object.values(groupedItems).map((group) => (
                      <div key={group.seller_id} className="seller-group review-mode">

                        {group.items.map(item => (
                          <div key={item.listing_id} className="checkout-item review-item">
                            <img src={item.image} alt={item.name} className="checkout-item-img" />
                            <div className="checkout-item-info">
                              <h3 className="checkout-item-name">{item.name}</h3>
                              <div className="checkout-item-meta">
                                Qty: {item.quantity} × {item.price.toFixed(2)} LE
                              </div>
                            </div>
                            <div className="checkout-item-price">{(item.price * item.quantity).toFixed(2)} LE</div>
                          </div>
                        ))}
                        <div className="summary-row mt-3 pt-3" style={{ borderTop: '1px solid var(--co-border)' }}>
                          <span>Subtotal:</span>
                          <strong>{group.total.toFixed(2)} LE</strong>
                        </div>
                        <div className="summary-row" style={{ fontSize: '0.9rem', color: 'var(--co-text-secondary)' }}>
                          <span>Shipping:</span>
                          <strong>5.00 LE</strong>
                        </div>
                        <div className="summary-row" style={{ fontSize: '1.1rem', fontWeight: '700', borderTop: '1px dashed var(--co-border)', paddingTop: '10px', marginTop: '10px' }}>
                          <span>Total:</span>
                          <strong>{(group.total + 5).toFixed(2)} LE</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="checkout-sidebar">
                  <div className="checkout-summary review-summary">
                    <h2 className="summary-title">Order Summary</h2>
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>{subtotal.toFixed(2)} LE</span>
                    </div>
                    <div className="summary-row">
                    <span>Shipping {shippingDetails.city ? `to ${shippingDetails.city}` : ''}</span>
                    <span>
                      {shippingDetails.city 
                        ? `${shippingCost.toFixed(2)} LE` 
                        : 'Calculated at checkout'}
                    </span>
                  </div>
                    <div className="summary-total">
                      <span>Total Amount</span>
                      <span>{total.toFixed(2)} LE</span>
                    </div>

                    <button
                      className="confirm-order-btn"
                      onClick={handleConfirmOrder}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Confirm Order'}
                    </button>

                   
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
