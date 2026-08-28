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
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f4f8' }}>
      <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '360px' }}>
        <h1 style={{ marginBottom: '1rem', color: '#1a202c', textAlign: 'center', fontSize: '1.75rem' }}>Verify Email</h1>
        <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Please enter the 6-digit verification code sent to your email address.
        </p>
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
          />
          <input 
            type="text" 
            placeholder="6-Digit Verification Code" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            required 
            maxLength={6}
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e0', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px' }}
          />
          <button disabled={loading} type="submit" style={{ padding: '0.75rem', backgroundColor: loading ? '#a0aec0' : '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Verifying...' : 'Verify & Activate'}
          </button>
        </form>
        {error && <p style={{ color: '#e53e3e', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
        {success && <p style={{ color: '#38a169', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{success}</p>}
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Back to <a href="https://login.veltrobridge.xyz" style={{ color: '#3182ce' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
