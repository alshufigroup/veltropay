import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects 'username'
      formData.append('password', password);
      
      const res = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      login(res.data.access_token);
      window.location.href = 'https://account.veltrobridge.xyz/home';
    } catch (err: any) {
      const errMsg = err.response?.data?.detail;
      if (errMsg === 'Email not verified') {
        window.location.href = 'https://login.veltrobridge.xyz/verify?email=' + encodeURIComponent(email);
      } else {
        setError(errMsg || 'Login failed');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f4f8' }}>
      <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '1.5rem', color: '#1a202c', textAlign: 'center' }}>Veltrobridge Login</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
          />
          <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Log In
          </button>
        </form>
        {error && <p style={{ color: '#e53e3e', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account? <a href="https://signup.veltrobridge.xyz" style={{ color: '#3182ce' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
