import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../Apis/authApi';
import './auth.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await loginUser({ username, password });
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);
                if (data.user.role === 'seller') {
                    navigate('/seller/dashboard');
                } else {
                    navigate('/home'); 
                }
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Panel */}
            <div className="login-left">
                <div className="login-brand">
                    <span className="login-brand-icon">K</span>
                    <span className="login-brand-name">Kemet</span>
                </div>
                <div className="login-left-content">
                    <h1 className="login-headline">Shop Local.<br />Live Better.</h1>
                    <p className="login-tagline">Egypt's marketplace for buyers and sellers who mean business.</p>
                    <div className="login-pills">
                        <span className="login-pill">🛒 Buyers</span>
                        <span className="login-pill">🏪 Sellers</span>
                        <span className="login-pill">🚚 Fast Delivery</span>
                    </div>
                </div>
                <div className="login-left-footer">
                    Trusted by 10,000+ users across Egypt
                </div>
            </div>

            {/* Right Panel */}
            <div className="login-right">
                <div className="login-card">
                    <h2 className="login-title">Welcome back</h2>
                    <p className="login-subtitle">Sign in to your account to continue</p>

                    {error && <div className="login-error">{error}</div>}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-field">
                            <label className="login-label">Username</label>
                            <input
                                type="text"
                                className="login-input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="login-field">
                            <label className="login-label">Password</label>
                            <input
                                type="password"
                                className="login-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? <span className="login-spinner" /> : 'Sign In →'}
                        </button>
                    </form>

                    <p className="login-footer-text">
                        Don't have an account? <a href="/signup" className="login-link">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;