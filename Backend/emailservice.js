const nodemailer = require('nodemailer');

// Create transporter once and reuse
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'mbesheer26105@gmail.com',
        pass: 'heim kzpi gvuy wqux',
    },
});

// Verify connection on startup (optional, logs any config issues)
transporter.verify()
    .then(() => console.log('✅ Email service ready'))
    .catch(err => console.error('❌ Email service error:', err.message));

/**
 * Send order confirmation email to buyer
 */
const sendOrderConfirmation = async (order, buyerEmail, buyerName) => {
    const { orderNumber, items, totalAmount, shippingDetails, status } = order;

    // Build items table rows
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">
                <strong>${item.listing_id?.title || 'Product'}</strong>
            </td>
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e9ecef;">
                ${item.quantity}
            </td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e9ecef;">
                $${item.price.toFixed(2)}
            </td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e9ecef;">
                $${(item.price * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    const shippingAddress = `
        ${shippingDetails.building ? shippingDetails.building + ', ' : ''}
        ${shippingDetails.floor ? 'Floor ' + shippingDetails.floor + ', ' : ''}
        ${shippingDetails.apartment ? 'Apt ' + shippingDetails.apartment + ', ' : ''}
        ${shippingDetails.addressLine1}
        ${shippingDetails.addressLine2 ? ', ' + shippingDetails.addressLine2 : ''}
        <br>${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.postalCode}
        <br>${shippingDetails.country}
    `;

    const mailOptions = {
        from: `"Kemet Store" <${process.env.EMAIL_USER}>`,
        to: buyerEmail,
        subject: `Order Confirmed #${orderNumber} - Kemet Store`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background: #f5f7fa;">
                <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🛍️ Order Confirmed!</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">
                            Thank you for your purchase, ${buyerName}!
                        </p>
                    </div>

                    <!-- Order Info -->
                    <div style="padding: 24px;">
                        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #64748b; font-size: 13px;">Order Number</span>
                                <span style="font-weight: 700; color: #1e293b;">#${orderNumber}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #64748b; font-size: 13px;">Status</span>
                                <span style="display: inline-block; padding: 2px 10px; background: #fef3c7; color: #92400e; border-radius: 12px; font-size: 12px; font-weight: 700;">${status?.toUpperCase()}</span>
                            </div>
                        </div>

                        <!-- Items Table -->
                        <h2 style="font-size: 18px; color: #1e293b; margin: 0 0 16px;">Order Items</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="padding: 12px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase;">Item</th>
                                    <th style="padding: 12px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase;">Qty</th>
                                    <th style="padding: 12px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase;">Price</th>
                                    <th style="padding: 12px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <!-- Total -->
                        <div style="border-top: 2px solid #e9ecef; padding-top: 16px; text-align: right;">
                            <span style="font-size: 16px; color: #64748b;">Total: </span>
                            <span style="font-size: 24px; font-weight: 700; color: #4f46e5;">$${totalAmount.toFixed(2)}</span>
                        </div>

                        <!-- Shipping Details -->
                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e9ecef;">
                            <h3 style="font-size: 16px; color: #1e293b; margin: 0 0 12px;">📦 Delivery Address</h3>
                            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                                <strong>${shippingDetails.firstName} ${shippingDetails.lastName}</strong><br>
                                ${shippingAddress}<br>
                                📞 ${shippingDetails.phone}
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                            Track your order anytime from your account dashboard.
                        </p>
                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                            © ${new Date().getFullYear()} Kemet Store. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Order confirmation sent to ${buyerEmail} for order #${orderNumber}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send order confirmation:`, error.message);
        // Don't throw — we don't want order placement to fail if email fails
        return { success: false, error: error.message };
    }
};

/**
 * Send order status update email to buyer
 */
const sendOrderStatusUpdate = async (order, buyerEmail, buyerName) => {
    const { orderNumber, status } = order;

    const statusColors = {
        pending: { bg: '#fef3c7', color: '#92400e' },
        processing: { bg: '#dbeafe', color: '#1e40af' },
        shipped: { bg: '#ffedd5', color: '#9a3412' },
        delivered: { bg: '#dcfce7', color: '#166534' },
        cancelled: { bg: '#fee2e2', color: '#991b1b' },
    };

    const style = statusColors[status?.toLowerCase()] || statusColors.pending;

    const mailOptions = {
        from: `"Kemet Store" <${process.env.EMAIL_USER}>`,
        to: buyerEmail,
        subject: `Order #${orderNumber} Status Update - ${status?.toUpperCase()}`,
        html: `
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; background: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="max-width: 500px; margin: 60px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="padding: 40px 32px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <h1 style="font-size: 22px; color: #1e293b; margin: 0 0 8px;">Order Status Updated</h1>
                        <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">
                            Hi ${buyerName}, your order <strong>#${orderNumber}</strong> has been updated.
                        </p>
                        <div style="display: inline-block; padding: 12px 24px; background: ${style.bg}; color: ${style.color}; border-radius: 8px; font-size: 18px; font-weight: 700;">
                            ${status?.toUpperCase()}
                        </div>
                        <p style="margin-top: 24px; color: #94a3b8; font-size: 12px;">
                            View your order details anytime from your account.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Status update sent to ${buyerEmail} for order #${orderNumber}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send status update:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
};