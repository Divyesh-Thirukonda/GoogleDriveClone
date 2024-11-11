import React, { useState } from 'react';
import axios from 'axios';

function Auth({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false); // Toggle between login and registration
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/login', { username, password });
            onLogin(res.data.token);
        } catch (error) {
            setMessage('Login failed. Please try again.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/register', { username, password });
            setMessage('Registration successful! You can now log in.');
            setIsRegister(false); // Switch back to login after successful registration
        } catch (error) {
            setMessage('Registration failed. Username may already be taken.' + `Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            <form onSubmit={isRegister ? handleRegister : handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
            </form>
            <p>{message}</p>
            <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
        </div>
    );
}

export default Auth;
