import React, { useState } from 'react';
import { registerUser } from '../../Apis/authApi';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', username: '', password: '', role: 'buyer' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await registerUser(formData);
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            
            // Redirect based on role
            navigate(data.user.role === 'seller' ? '/seller/orders' : '/products');
        } else {
            alert(data.message || "Registration failed");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input type="text" placeholder="First Name" onChange={(e) => setFormData({...formData, firstName: e.target.value})} style={styles.input} required />
                    <input type="text" placeholder="Last Name" onChange={(e) => setFormData({...formData, lastName: e.target.value})} style={styles.input} required />
                    <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} style={styles.input} required />
                    <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} style={styles.input} required />
                    <select onChange={(e) => setFormData({...formData, role: e.target.value})} style={styles.input}>
                        <option value="buyer">I want to Buy</option>
                        <option value="seller">I want to Sell</option>
                    </select>
                    <button type="submit" style={styles.button}>Sign Up</button>
                </form>
                <p style={{marginTop: '15px', color: '#666'}}>Already have an account? <a href="/login">Login</a></p>
            </div>
        </div>
    );
};

// Quick CSS-in-JS to match your dashboard theme
const styles = {
    container: { background: 'linear-gradient(135deg, #d6e4f0 0%, #ffffff 100%)', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    card: { background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '350px' },
    title: { textAlign: 'center', color: '#2c3e50', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' },
    button: { padding: '12px', borderRadius: '8px', border: 'none', background: '#4a90e2', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
};

export default Signup;