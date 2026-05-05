import React, { useState } from 'react';
import { registerUser } from '../../Apis/authApi';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', username: '', password: '', role: 'buyer' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await registerUser(formData);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);
                navigate(data.user.role === 'seller' ? '/seller/orders' : '/products');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            {/* LEFT — Form */}
            <div className="signup-left">
                <div className="signup-card">
                    <div className="signup-brand">
                        <span className="signup-brand-icon">K</span>
                        <span className="signup-brand-name">Kemet</span>
                    </div>

                    <div className="signup-steps">
                        <div className={`signup-step-dot ${step >= 1 ? 'active' : ''}`} />
                        <div className="signup-step-line" />
                        <div className={`signup-step-dot ${step >= 2 ? 'active' : ''}`} />
                    </div>

                    <h2 className="signup-title">
                        {step === 1 ? 'Create your account' : 'Almost there!'}
                    </h2>
                    <p className="signup-subtitle">
                        {step === 1 ? 'Step 1 of 2 — Personal info' : 'Step 2 of 2 — Account setup'}
                    </p>

                    {error && <div className="signup-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="signup-form">
                        {step === 1 && (
                            <div className="signup-step-content" key="step1">
                                <div className="signup-row">
                                    <div className="signup-field">
                                        <label className="signup-label">First Name</label>
                                        <input className="signup-input" name="firstName" placeholder="e.g. John" value={formData.firstName} onChange={handleChange} required />
                                    </div>
                                    <div className="signup-field">
                                        <label className="signup-label">Last Name</label>
                                        <input className="signup-input" name="lastName" placeholder="e.g. Doe" value={formData.lastName} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="signup-field">
                                    <label className="signup-label">I want to</label>
                                    <div className="signup-role-toggle">
                                        <button
                                            type="button"
                                            className={`signup-role-btn ${formData.role === 'buyer' ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, role: 'buyer' })}
                                        >
                                            🛒 Buy
                                        </button>
                                        <button
                                            type="button"
                                            className={`signup-role-btn ${formData.role === 'seller' ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, role: 'seller' })}
                                        >
                                            🏪 Sell
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="signup-btn"
                                    onClick={() => {
                                        if (!formData.firstName || !formData.lastName) return setError('Please fill in your name');
                                        setError('');
                                        setStep(2);
                                    }}
                                >
                                    Continue →
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="signup-step-content" key="step2">
                                <div className="signup-field">
                                    <label className="signup-label">Username</label>
                                    <input className="signup-input" name="username" placeholder="Choose a username" value={formData.username} onChange={handleChange} required />
                                </div>
                                <div className="signup-field">
                                    <label className="signup-label">Password</label>
                                    <input className="signup-input" type="password" name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} required />
                                </div>

                                <div className="signup-btn-row">
                                    <button type="button" className="signup-btn-back" onClick={() => setStep(1)}>
                                        ← Back
                                    </button>
                                    <button type="submit" className="signup-btn" disabled={loading}>
                                        {loading ? <span className="signup-spinner" /> : 'Create Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <p className="signup-footer-text">
                        Already have an account? <a href="/login" className="signup-link">Sign in</a>
                    </p>
                </div>
            </div>

            {/* RIGHT — Visual */}
            <div className="signup-right">
                <div className="signup-right-content">
                    <h1 className="signup-headline">
                        {formData.role === 'seller' ? 'Start selling\ntoday.' : 'Discover\namazing\nproducts.'}
                    </h1>
                    <p className="signup-tagline">
                        {formData.role === 'seller'
                            ? 'List your products, reach thousands of buyers, and grow your business with Kemet.'
                            : 'Browse thousands of local listings, support Egyptian sellers, and get fast delivery.'}
                    </p>
                    <div className="signup-feature-list">
                        {(formData.role === 'seller' ? [
                            '📦 Easy listing creation',
                            '📊 Sales analytics dashboard',
                            '🚀 Instant order notifications',
                        ] : [
                            '🛒 Secure checkout',
                            '⭐ Verified seller reviews',
                            '🚚 Fast local delivery',
                        ])
                        .map((f, i) => (
                            <div key={i} className="signup-feature">{f}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;