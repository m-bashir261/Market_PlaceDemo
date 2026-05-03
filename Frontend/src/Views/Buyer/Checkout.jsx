import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { Store, ShoppingCart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Group items by seller_id
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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = Object.keys(groupedItems).length * 5; // $5 per seller
  const total = subtotal + shipping;

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const orderPromises = Object.values(groupedItems).map(async (group) => {
        const orderItems = group.items.map(i => ({
            listing_id: i.listing_id,
            quantity: i.quantity,
            price: i.price
        }));

        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            seller_id: group.seller_id,
            items: orderItems,
            totalAmount: group.total + 5 // item total + shipping
          })
        });

        if (!response.ok) {
           throw new Error('Failed to place order for seller: ' + group.seller);
        }
      });

      await Promise.all(orderPromises);
      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error(err);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">
          <header className="checkout-header">
            <h1 className="checkout-title">Checkout</h1>
            <p className="text-secondary">Review your cart and confirm your orders.</p>
          </header>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={48} className="empty-icon" />
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything yet.</p>
              <button className="confirm-order-btn" onClick={() => navigate('/products')} style={{maxWidth: '250px', margin: '20px auto 0'}}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="checkout-content">
              <div className="checkout-items-wrapper">
                {Object.values(groupedItems).map((group) => (
                  <div key={group.seller_id} className="seller-group">
                    <div className="seller-header">
                      <Store className="seller-icon" size={20} />
                      Order from {group.seller}
                    </div>
                    {group.items.map(item => (
                      <div key={item.listing_id} className="checkout-item">
                        <img src={item.image} alt={item.name} className="checkout-item-img" />
                        <div className="checkout-item-info">
                          <h3 className="checkout-item-name">{item.name}</h3>
                          <div className="checkout-item-meta">
                            Qty: {item.quantity}
                          </div>
                          <div className="checkout-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                        <button className="remove-btn" onClick={() => removeFromCart(item.listing_id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <div className="summary-row mt-3 pt-3" style={{borderTop: '1px solid var(--co-border)'}}>
                       <span>Seller Subtotal:</span>
                       <strong>${group.total.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-sidebar">
                <div className="checkout-summary">
                  <h2 className="summary-title">Order Summary</h2>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping ({Object.keys(groupedItems).length} sellers)</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <button 
                    className="confirm-order-btn" 
                    onClick={handleConfirmOrder}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm Orders'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
