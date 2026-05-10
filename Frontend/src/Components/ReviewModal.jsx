import React, { useState, useEffect } from 'react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, listingId, orderId, onSuccess, showToast, existingReview = null }) => {
  // If editing, start with existing data. Otherwise, default.
    const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
    const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Reset state if the modal opens with different data
    useEffect(() => {
        if (existingReview) {
        setRating(existingReview.rating);
        setComment(existingReview.comment);
        } else {
        setRating(5);
        setComment('');
        }
    }, [existingReview, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
        const token = localStorage.getItem('token');
        
        // Determine if we are POSTing a new review or PUTting an edit
        const url = existingReview 
            ? `${process.env.REACT_APP_API_URL}/api/reviews/${existingReview._id}` 
            : `${process.env.REACT_APP_API_URL}/api/reviews`;
        
        const method = existingReview ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                listing_id: listingId,
                order_id: orderId,
                rating,
                comment
            }),
        });

        if (response.ok) {
            showToast(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!', 'success');
            onSuccess(orderId, 'updated'); // Tell parent it was successful
            onClose();
            setShowDeleteConfirm(false); // add after every onClose()
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to save review', 'error');
            
            if (!existingReview && err.message && err.message.toLowerCase().includes('already reviewed')) {
            onSuccess(orderId, 'updated');
            onClose();
            setShowDeleteConfirm(false); // add after every onClose()
            }
        }
        } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred while saving the review.', 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        
        
        setIsDeleting(true);
        try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/${existingReview._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Review deleted successfully!', 'success');
            onSuccess(orderId, 'deleted'); // Tell parent the review is gone
            onClose();
            setShowDeleteConfirm(false); // add after every onClose()
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to delete review', 'error');
        }
        } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred while deleting the review.', 'error');
        } finally {
        setIsDeleting(false);
        }
    };

    return (
        <div className="review-modal-overlay">
        <div className="review-modal-content">
            <h2 className="review-modal-title">
            {existingReview ? 'Edit Your Review' : 'Rate This Item'}
            </h2>
            
            <form onSubmit={handleSubmit}>
            {/* Star Selector */}
            <div className="review-star-container">
                {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`review-star ${star <= rating ? 'active' : 'inactive'}`}
                >
                    ★
                </button>
                ))}
            </div>

            {/* Comment Box */}
            <textarea
                className="review-textarea"
                placeholder="Tell us what you thought..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
            />

            {/* Actions */}
            <div className="review-modal-actions">
                {existingReview && (
                    showDeleteConfirm ? (
                        <div className="review-delete-bar">
                            <span>Delete permanently?</span>
                            <div className="review-delete-bar-actions">
                                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="review-btn-cancel">Keep</button>
                                <button type="button" onClick={handleDelete} disabled={isDeleting} className="review-btn-delete">
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setShowDeleteConfirm(true)} className="review-btn-delete">
                            Delete
                        </button>
                    )
                )}
                {!showDeleteConfirm && (
                    <>
                        <button type="button" onClick={onClose} className="review-btn-cancel">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="review-btn-submit">
                            {isSubmitting ? 'Saving...' : (existingReview ? 'Update Review' : 'Submit Review')}
                        </button>
                    </>
                )}
            </div>
            </form>
        </div>
        </div>
    );
};

export default ReviewModal;