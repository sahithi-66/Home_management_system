import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock authentication (replace with real authentication logic)
        if (username === 'admin' && password === 'password') {
            console.log('Login successful!');
            onLoginSuccess(); // Call the success handler from props
        } else {
            alert('Invalid username or password');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Welcome to Home Management</h1>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-field">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-field">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
