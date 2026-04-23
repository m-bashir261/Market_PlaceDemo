import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../Apis/authApi';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const data = await loginUser({username, password });

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            
            // Logic to separate Buyer and Seller apps
            if(data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);
             
                if (data.user.role === 'seller') {
                    navigate('/seller/orders');
                } else {
                    navigate('/products'); // For buyers, you might want to navigate to a different page like '/products'
                }
            }
        } else {
            alert(data.message || "Invalid Login");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.loginCard}>
                <h2 style={styles.text}>Welcome Back</h2>
                <form onSubmit={handleLogin} style={styles.form}>
                    <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} style={styles.input} required/>
                    <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={styles.input} required/>
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                <p style={{marginTop: '15px', color: '#666'}}>Don't have an account? <a href="/signup">Sign up</a></p>
            </div>
        </div>
    );
};

const styles = {
    page: {
        height: '100vh',
        background: 'linear-gradient(135deg, #d6e4f0 0%, #ffffff 100%)',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    loginCard: {
        background: 'white', padding: '50px', borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.05)', textAlign: 'center', width: '400px'
    },
    // Add this section here:
    text: {
        color: '#333',
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    input: { padding: '15px', borderRadius: '10px', border: '1px solid #e1e8ef', outline: 'none' },
    button: { padding: '15px', borderRadius: '10px', border: 'none', background: '#4a90e2', color: 'white', fontWeight: '600', cursor: 'pointer' }
};

export default Login;