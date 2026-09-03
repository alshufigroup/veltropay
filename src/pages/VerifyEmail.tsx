import React, { useState, useEffect } from 'react';
import { api } from '../api';

const VerifyEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const isSubdomainSetup = typeof window !== 'undefined' && window.location.hostname.endsWith('veltrobridge.xyz');
  const loginUrl = isSubdomainSetup ? 'https://login.veltrobridge.xyz' : '/login';
  const signupUrl = isSubdomainSetup ? 'https://signup.veltrobridge.xyz' : '/signup';
  const marketingUrl = isSubdomainSetup ? 'https://veltrobridge.xyz' : '/';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam.trim());
    }
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    if (cleanCode.length !== 6) {
      setError('Verification code must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', {
        email: cleanEmail,
        code: cleanCode
      });
      setSuccess('Email verified successfully! Preparing your secure dashboard...');
      setTimeout(() => {
        window.location.href = loginUrl;
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code. Please request a new code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address to resend the code.');
      return;
    }

    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      await api.post('/auth/resend-verification', { email: cleanEmail });
      setResendMessage('A new 6-digit code has been dispatched to your inbox.');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to dispatch code. Please verify your email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className='auth-wrapper'>
      <div className='bg' />
      
      <div className='auth-card'>
        {/* Brand Header */}
        <div className='auth-brand'>
          <a href={marketingUrl} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} title='Back to VeltroPay Home'>
            <div className='auth-brand-badge'>
              <span className='material-symbols-outlined'>bolt</span>
            </div>
            <h2>VeltroPay</h2>
          </a>
        </div>

        <p className='auth-subtitle'>
          Please enter the 6-digit security verification code sent to your registered email address.
        </p>

        {error && (
          <div className='status-msg status-msg-error' style={{ marginBottom: '1.2rem', marginTop: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>error</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className='status-msg status-msg-success' style={{ marginBottom: '1.2rem', marginTop: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {resendMessage && !success && (
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#93c5fd', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>info</span>
            <span>{resendMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className='auth-form'>
          {/* Email Address */}
          <label htmlFor='verify-email'>Registered Email Address</label>
          <input 
            id='verify-email'
            type='email' 
            placeholder='name@example.com' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className='form-control-input'
            disabled={loading}
          />

          {/* 6-Digit Code */}
          <label htmlFor='verify-code'>6-Digit Verification Code</label>
          <input 
            id='verify-code'
            type='text' 
            inputMode='numeric'
            autoComplete='one-time-code'
            placeholder='••••••' 
            value={code} 
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
            required 
            maxLength={6}
            style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: '8px', fontFamily: 'monospace', fontWeight: 800, color: '#38bdf8' }}
            className='form-control-input'
            disabled={loading}
          />

          {/* Resend Code Trigger */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 0 1.3rem 0', fontSize: '0.84rem' }}>
            <span style={{ color: '#94a3b8' }}>Didn&apos;t receive the code?</span>
            <button 
              type='button' 
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendLoading}
              style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#64748b' : '#38bdf8', fontWeight: 600, cursor: resendCooldown > 0 ? 'default' : 'pointer', padding: 0 }}
            >
              {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>

          {/* Submit Action */}
          <button 
            type='submit' 
            disabled={loading || code.length !== 6}
            className='btn-primary-action'
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <span className='material-symbols-outlined spinner-rotate' style={{ fontSize: '1.2rem' }}>sync</span>
                <span>Verifying Account...</span>
              </>
            ) : (
              <>
                <span>Verify & Activate Account</span>
                <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>verified</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className='auth-links' style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href={signupUrl} style={{ color: '#94a3b8' }}>
            Change Email
          </a>
          <span style={{ color: '#475569' }}>•</span>
          <a href={loginUrl} style={{ color: '#38bdf8', fontWeight: 600 }}>
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
