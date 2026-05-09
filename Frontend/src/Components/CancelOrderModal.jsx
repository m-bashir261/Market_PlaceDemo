import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import './CancelOrderModal.css';

/**
 * CancelOrderModal
 * A confirmation modal shown before cancelling an order.
 * Props:
 *   order    – the order object (for display info)
 *   onConfirm – async function called when user confirms
 *   onClose   – function called to dismiss
 *   loading   – bool, shows spinner while request is in-flight
 */
export default function CancelOrderModal({ order, onConfirm, onClose, loading }) {
  if (!order) return null;

  const firstItemTitle = order.items?.[0]?.listing_id?.title || 'this order';

  return (
    <div className="com-overlay" onClick={onClose}>
      <div className="com-modal" onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button className="com-close" onClick={onClose} disabled={loading}>
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="com-icon-wrapper">
          <AlertTriangle size={32} className="com-icon" />
        </div>

        {/* Copy */}
        <h2 className="com-title">Cancel Order?</h2>
        <p className="com-subtitle">
          Are you sure you want to cancel <strong>{order.orderNumber}</strong>?<br />
          <span className="com-product-name">{firstItemTitle}{order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ''}</span>
        </p>
        <p className="com-warning">
          Stock will be restored. This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="com-actions">
          <button className="com-btn-secondary" onClick={onClose} disabled={loading}>
            Keep Order
          </button>
          <button className="com-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading
              ? <><Loader2 size={16} className="com-spinner" /> Cancelling…</>
              : 'Yes, Cancel Order'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
