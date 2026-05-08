// LoadingScreen.jsx
import React from 'react';
import Lottie from 'lottie-react';
// Replace with your local JSON file path or import
import loadingAnimation from '../assets/loading.json'; // adjust path

const LoadingScreen = () => {
return (
<div style={styles.container}>
    <div style={styles.content}>
    <div style={styles.spinnerWrapper}>
        <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 120, height: 120, margin: '0 auto' }}
        />
    </div>
    <h2 style={styles.title}>Loading ...</h2>
    <p style={styles.subtitle}>Please wait while we fetch the latest data</p>
    
    </div>
</div>
);
};

const styles = {
container: {
position: 'relative',
width: '100%',
minHeight: '100vh',
backgroundColor: 'rgba(15, 23, 42, 0.95)',
backdropFilter: 'blur(8px)',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
zIndex: 800,
fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
},
content: {
textAlign: 'center',
padding: '2rem',
borderRadius: '24px',
backgroundColor: '#1e293b',
boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
minWidth: '320px',
},
spinnerWrapper: {
marginBottom: '24px',
},
spinner: {
width: '64px',
height: '64px',
margin: '0 auto',
borderRadius: '50%',
border: '4px solid #334155',
borderTopColor: '#3b82f6',
animation: 'spin 0.8s linear infinite',
},
title: {
fontSize: '1.5rem',
fontWeight: '600',
color: '#f1f5f9',
margin: '0 0 12px 0',
},
subtitle: {
fontSize: '0.9rem',
color: '#94a3b8',
margin: '0 0 28px 0',
},
progressBar: {
width: '260px',
height: '4px',
backgroundColor: '#334155',
borderRadius: '999px',
overflow: 'hidden',
margin: '0 auto',
},
progressFill: {
width: '40%',
height: '100%',
backgroundColor: '#3b82f6',
borderRadius: '999px',
animation: 'pulse 1.2s ease-in-out infinite',
},
};

// Add keyframes for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes spin {
to { transform: rotate(360deg); }
}
@keyframes pulse {
0% { transform: translateX(-100%); }
100% { transform: translateX(250%); }
}
`;
document.head.appendChild(styleSheet);

export default LoadingScreen;