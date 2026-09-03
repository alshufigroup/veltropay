import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects 'username'
      formData.append('password', password);
      
      const res = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      login(res.data.access_token);
      window.location.href = 'https://account.veltrobridge.xyz/home?token=' + encodeURIComponent(res.data.access_token);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail;
      if (errMsg === 'Email not verified') {
        window.location.href = 'https://login.veltrobridge.xyz/verify?email=' + encodeURIComponent(email);
      } else {
        setError(errMsg || 'Sign in failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-wrapper'>
      <div className='bg' />
      <div className='auth-card'>
        <div className='auth-brand'>
          <div className='auth-brand-badge'>
            <span className='material-symbols-outlined'>bolt</span>
          </div>
          <h2>VeltroPay</h2>
        </div>
        <p className='auth-subtitle'>
          Welcome back! Sign in to access your multi-currency accounts and transfers.
        </p>

        <form onSubmit={handleLogin} className='auth-form'>
          <label htmlFor='login-email'>Email Address</label>
          <input 
            id='login-email'
            type='email' 
            placeholder='name@example.com' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className='form-control-input'
          />

          <label htmlFor='login-password'>Password</label>
          <input 
            id='login-password'
            type='password' 
            placeholder='••••••••' 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className='form-control-input'
          />

          {error && <div className='status-msg status-msg-error' style={{ marginBottom: '1.2rem', marginTop: '0' }}>{error}</div>}

          <button 
            type='submit' 
            disabled={loading}
            className='btn-primary-action'
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className='auth-links'>
          <span>Don&apos;t have an account? </span>
          <a href='https://signup.veltrobridge.xyz'>
            Create account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
