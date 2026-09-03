import React, { useState } from 'react';
import { api } from '../api';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSubdomainSetup = typeof window !== 'undefined' && window.location.hostname.endsWith('veltrobridge.xyz');
  const loginUrl = isSubdomainSetup ? 'https://login.veltrobridge.xyz' : '/login';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        currency
      });
      if (isSubdomainSetup) {
        window.location.href = 'https://login.veltrobridge.xyz/verify?email=' + encodeURIComponent(email);
      } else {
        window.location.href = '/verify?email=' + encodeURIComponent(email);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
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
          Create your free multi-currency account in seconds and unlock borderless transfers.
        </p>

        <form onSubmit={handleSignup} className='auth-form'>
          <label htmlFor='signup-name'>Full Legal Name</label>
          <input 
            id='signup-name'
            type='text' 
            placeholder='e.g. John Doe' 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
            className='form-control-input'
          />

          <label htmlFor='signup-email'>Email Address</label>
          <input 
            id='signup-email'
            type='email' 
            placeholder='name@example.com' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className='form-control-input'
          />

          <label htmlFor='signup-password'>Password</label>
          <input 
            id='signup-password'
            type='password' 
            placeholder='••••••••' 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className='form-control-input'
          />

          <label htmlFor='signup-currency'>Primary Account Currency</label>
          <select 
            id='signup-currency'
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)} 
            className='form-select'
          >
            <option value='EUR'>Euro (EUR - €)</option>
            <option value='USD'>US Dollar (USD - $)</option>
            <option value='GBP'>British Pound (GBP - £)</option>
          </select>

          {error && <div className='status-msg status-msg-error' style={{ marginBottom: '1.2rem', marginTop: '0' }}>{error}</div>}

          <button 
            type='submit' 
            disabled={loading}
            className='btn-primary-action'
          >
            {loading ? 'Creating Account...' : 'Open Free Account'}
          </button>
        </form>

        <div className='auth-links'>
          <span>Already have an account? </span>
          <a href={loginUrl}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
