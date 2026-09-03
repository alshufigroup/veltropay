import React, { useState, useContext } from 'react';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

const Signin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      login(res.data.access_token);
      window.location.href = '/home';
    } catch (err: any) {
      const errMsg = err.response?.data?.detail;
      if (errMsg === 'Email not verified') {
        window.location.href = '/verify?email=' + encodeURIComponent(email);
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
          <div className='auth-brand-badge'>⚡</div>
          <h2>VeltroPay</h2>
        </div>
        <p className='auth-subtitle'>
          Sign in to your VeltroPay account to manage balances, cards, and instant transfers.
        </p>

        <form onSubmit={handleSubmit} className='auth-form'>
          <label htmlFor='signin-email' style={{ marginBottom: '6px', fontSize: '0.88rem' }}>
            Email Address
          </label>
          <input
            id='signin-email'
            required
            name='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='name@example.com'
            className='form-control-input'
          />

          <label htmlFor='signin-password' style={{ marginBottom: '6px', fontSize: '0.88rem' }}>
            Password
          </label>
          <input
            id='signin-password'
            required
            name='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
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

export default Signin;
