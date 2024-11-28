import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess, setUsername }) => {
    const [localUsername, setLocalUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: localUsername, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token); // Save the token
                setUsername(localUsername);
                onLoginSuccess();
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Login failed:', error);
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
                            value={localUsername} 
                            onChange={(e) => setLocalUsername(e.target.value)} 
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