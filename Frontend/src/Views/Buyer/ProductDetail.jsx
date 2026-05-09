import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import AIReviewSummary from '../../Components/AIReviewSummary';
import { getProductById, getComments, addComment, likeComment, replyToComment, getReviews } from '../../services/products';
import { useCart } from '../../context/CartContext';


function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? 'star filled' : 'star'}>
          &#9733;
        </span>
      ))}
      <span className="rating-number">{rating}</span>
    </div>
  );
}

function SellerReputation({ product }) {
  return (
    <span className="seller-reputation" title="Seller Reputation Flags">
        🚩 {product.flags || 0}
    </span>
  );
}
 
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [orderCreated, setOrderCreated] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();

  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState({ message: '', type: '' });

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1])).id;
    } catch(e) { return null; }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        
        // Map backend fields to the component's expected fields
        const mappedProduct = {
          id: data._id,
          listing_id: data._id,
          name: data.title,
          price: data.price,
          seller: data.seller_id?.username || 'Unknown Seller',
          seller_id: data.seller_id?._id || data.seller_id,
          sellerRating: 4.5, // Default or calculate if available
          flags: data.seller_id?.flags || 0,
          sellerSales: data.seller_sales || 0,
          deliveryTime: data.delivery_days ? `${data.delivery_days} day(s)` : 'N/A',
          description: data.description,
          image: data.image_url || 'https://i.ibb.co/000000/default-image.jpg',
          category: data.category_name,
          stock: data.countInStock || 0,
          serviceableAreas: data.serviceableAreas || [],
        };
        
        setProduct(mappedProduct);

        const [commentsData, reviewsData] = await Promise.all([
          getComments(id),
          getReviews(id)
        ]);
        setComments(commentsData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching product or comments:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const totalPrice = useMemo(
    () => {
      if (!product) return 0;
      return Number((product.price * quantity).toFixed(2));
    },
    [product, quantity]
  );
 
  const handleQuantityChange = (event) => {
    const value = Number(event.target.value);
    if (value < 1) { setQuantity(1); return; }
    if (value > product.stock) { setQuantity(product.stock); return; }
    setQuantity(value);
  };
 
  const handleAddToCart = () => {

    const token = localStorage.getItem('token');
      if (!token) {
        // You can use a standard alert, or replace this with your 
        // custom UI notification (like a Toast or setting an error state)
        alert('You must be logged in to place an order.');
        
        // Return early to stop the function from running the fetch request
        return; 
      }
    addToCart({
      listing_id: product.listing_id,
      name: product.name,
      price: product.price,
      seller: product.seller,
      seller_id: product.seller_id,
      image: product.image,
      quantity: quantity,
      serviceableAreas: product.serviceableAreas
    });
    setOrderCreated(true);
    setTimeout(() => setOrderCreated(false), 3000);
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to comment.');
            return;
        }

        // Validate token: check if valid, not expired, and role is buyer
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            if (payload.exp < currentTime) {
                showToast('Your session has expired. Please login again.');
                return;
            }
            if (payload.role !== 'buyer') {
                showToast('Only buyers can comment.');
                return;
            }
        } catch (decodeError) {
            showToast('Invalid token. Please login again.');
            return;
        }

        const addedComment = await addComment(id, newCommentText, token);
        setComments([addedComment, ...comments]);
        setNewCommentText("");
    } catch (err) {
        console.error("Error adding comment", err);
        alert('Failed to add comment. Please try again.');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login to like');

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            if (payload.exp < currentTime) {
                return alert('Your session has expired. Please login again.');
            }
            if (payload.role !== 'buyer') {
                return alert('Only buyers can like comments.');
            }
        } catch (decodeError) {
            return alert('Invalid token. Please login again.');
        }

        const likes = await likeComment(id, commentId, token);
        setComments(comments.map(c => c._id === commentId ? { ...c, likes } : c));
    } catch (err) {
        console.error("Error liking comment", err);
    }
  };

  const handleReply = async (commentId, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login to reply');

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            if (payload.exp < currentTime) {
                return alert('Your session has expired. Please login again.');
            }
            if (payload.role !== 'buyer') {
                return alert('Only buyers can reply to comments.');
            }
        } catch (decodeError) {
            return alert('Invalid token. Please login again.');
        }

        const updatedComment = await replyToComment(id, commentId, replyText, token);
        setComments(comments.map(c => c._id === commentId ? updatedComment : c));
        setReplyingTo(null);
        setReplyText("");
    } catch (err) {
        console.error("Error replying", err);
        alert('Failed to add reply. Please try again.');
    }
  };
 
  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <main className="page-body" style={{ textAlign: 'center', padding: '100px' }}>
          <h2>Loading product details...</h2>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <main className="page-body" style={{ textAlign: 'center', padding: '100px' }}>
          <h2>Product Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/products')} className="modern-btn mt-4">Back to Catalog</button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-page">
 
      {/* ── Navbar ── */}
      <Navbar />
 
      <main className="page-body">
        {toast.message && (
          <div className={`toast-notification ${toast.type}`}>
            {toast.message}
          </div>
        )}
 
        {/* ── Breadcrumb ── */}
        <nav className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a>
          <span className="breadcrumb-sep">›</span>
          <a href="/catalog" className="breadcrumb-link">Catalog</a>
          <span className="breadcrumb-sep">›</span>
          <a href={`/catalog?category=${product.category}`} className="breadcrumb-link">
            {product.category}
          </a>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>
 
        {/* ── Main Product Card ── */}
        <section className="product-detail-card">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>
 
          <div className="product-detail-info">
            <div className="product-detail-top">
              <div>
                <p className="product-category">{product.category}</p>
                <h1>{product.name}</h1>
              </div>
              <span className="product-price">{product.price.toFixed(2)} LE</span>
            </div>
 
            <p className="product-description">{product.description}</p>
 
            <div className="product-meta-row">
              <div>
                <span className="label">Seller</span>
                <p>{product.seller}</p>
              </div>
              <div>
                <span className="label">Available</span>
                <p>{product.stock} in stock</p>
              </div>
              <div>
                <span className="label">Delivery</span>
                <p>{product.deliveryTime}</p>
              </div>
            </div>
 
            <div className="order-controls">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
 
            <div className="order-summary">
              <p><strong>Total</strong></p>
              <p className="total-price">{totalPrice.toFixed(2)} LE</p>
            </div>
 
            <button
              className="place-order-button"
              type="button"
              onClick={handleAddToCart}
              disabled={orderCreated}
            >
              {orderCreated ? '✓ Product Added' : 'Add To Cart'}
            </button>
          </div>
        </section>
 
        {/* ── Seller Mini Card ── */}
        <section className="seller-card">
          <h2 className="section-title">About the Seller</h2>
          <div className="seller-card-inner">
            <div className="seller-avatar-large">
              {product.seller.charAt(0)}
            </div>
            <div className="seller-card-info">
              <h3 className="seller-card-name">{product.seller}</h3>
              <StarRating rating={product.sellerRating} />
              <SellerReputation product={product} />
              <p className="seller-sales">{product.sellerSales} sales completed</p>
            </div>
            <button onClick={() => navigate(`/shop/${encodeURIComponent(product.seller)}`)} className="view-shop-btn">
              View Shop
            </button>
          </div>
        </section>
 
        {/* ── Reviews & Comments Section ── */}
        <section className="reviews-section">
          <div className="section-header-tabs">
             <h2 className="section-title">Customer Feedback</h2>
          </div>

          {/* ── AI Summary Card ── */}
          <AIReviewSummary listingId={product.listing_id} />

          {/* ── Real Reviews (from Review model) ── */}
          <div className="reviews-list-container">
            <h3 className="subsection-title">Recent Reviews</h3>
            {reviews.length === 0 ? (
              <p className="placeholder-text">No reviews yet for this product.</p>
            ) : (
              <div className="reviews-grid">
                {reviews.map(review => (
                  <div key={review._id} className="review-card glass-card">
                    <div className="review-header">
                      <div className="review-user">
                        <div className="user-avatar">{review.buyer_id?.username?.charAt(0).toUpperCase() || 'U'}</div>
                        <div>
                          <span className="user-name">{review.buyer_id?.username || 'Verified Buyer'}</span>
                          <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="review-comment">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="section-divider" />

          {/* ── Comments (from Comment model) ── */}
          <h3 className="subsection-title" style={{marginTop: '40px'}}>General Comments</h3>
          <div className="add-comment-section">
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea 
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Ask a question or leave a comment..."
                className="comment-input"
                rows="3"
              />
              <button type="submit" className="modern-btn mt-2">Post Comment</button>
            </form>
          </div>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="reviews-placeholder-title" style={{marginTop: '20px'}}>No comments yet. Be the first to ask a question!</p>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="comment-card">
                  {/* ... same comment card code ... */}
                  <div className="comment-top-row">
                    <div className="comment-avatar">
                      {(comment.user_id?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-author-block">
                      <span className="comment-author">{comment.user_id?.username || 'Unknown'}</span>
                      <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button 
                      onClick={() => handleLikeComment(comment._id)} 
                      className={`heart-btn ${comment.likes?.includes(currentUserId) ? 'liked' : ''}`}
                    >
                      {comment.likes?.includes(currentUserId) ? '❤️' : '🤍'} {comment.likes?.length || 0}
                    </button>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  
                  <div className="comment-actions">
                    <button 
                      onClick={() => {
                        setReplyingTo(replyingTo === comment._id ? null : comment._id);
                        setReplyText("");
                      }} 
                      className="action-btn"
                    >
                      Reply
                    </button>
                  </div>

                  {replyingTo === comment._id && (
                    <form onSubmit={(e) => handleReply(comment._id, e)} className="reply-form mt-2">
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="reply-input"
                      />
                      <button type="submit" className="modern-btn-small ml-2">Post</button>
                    </form>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-list">
                      {comment.replies.map((reply, idx) => (
                        <div key={idx} className="reply-card">
                          <div className="comment-top-row reply-top-row">
                            <div className="comment-avatar reply-avatar">
                              {(reply.user_id?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="comment-author-block">
                              <span className="comment-author">{reply.user_id?.username || 'Unknown'}</span>
                              <span className="comment-date">{new Date(reply.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="comment-text">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
 
      </main>
      <Footer />
    </div>
  );
}
 
export default ProductDetail;
 