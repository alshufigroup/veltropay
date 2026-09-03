import React, { useState, useEffect } from 'react';
import { api } from '../api';

const VerifyEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Grab email from query param if available
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/verify-email', {
        email,
        code
      });
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = 'https://login.veltrobridge.xyz';
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed. Please check the code.');
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
          Please enter the 6-digit verification code sent to your email address.
        </p>

        <form onSubmit={handleVerify} className='auth-form'>
          <label htmlFor='verify-email' style={{ marginBottom: '6px', fontSize: '0.88rem' }}>
            Email Address
          </label>
          <input 
            id='verify-email'
            type='email' 
            placeholder='name@example.com' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className='form-control-input'
          />

          <label htmlFor='verify-code' style={{ marginBottom: '6px', fontSize: '0.88rem' }}>
            6-Digit Verification Code
          </label>
          <input 
            id='verify-code'
            type='text' 
            placeholder='123456' 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            required 
            maxLength={6}
            style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontFamily: 'monospace', fontWeight: 700 }}
            className='form-control-input'
          />

          {error && <div className='status-msg status-msg-error' style={{ marginBottom: '1.2rem', marginTop: '0' }}>{error}</div>}
          {success && <div className='status-msg status-msg-success' style={{ marginBottom: '1.2rem', marginTop: '0' }}>{success}</div>}

          <button 
            type='submit' 
            disabled={loading}
            className='btn-primary-action'
          >
            {loading ? 'Verifying...' : 'Verify & Activate Account'}
          </button>
        </form>

        <div className='auth-links'>
          <span>Back to </span>
          <a href='https://login.veltrobridge.xyz'>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
