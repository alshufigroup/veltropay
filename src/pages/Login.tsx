import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const isSubdomainSetup = typeof window !== 'undefined' && window.location.hostname.endsWith('veltrobridge.xyz');
  const signupUrl = isSubdomainSetup ? 'https://signup.veltrobridge.xyz' : '/signup';
  const marketingUrl = isSubdomainSetup ? 'https://veltrobridge.xyz' : '/';

  useEffect(() => {
    const saved = localStorage.getItem('veltropay_remembered_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', cleanEmail);
      formData.append('password', password);
      
      const res = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (rememberMe) {
        localStorage.setItem('veltropay_remembered_email', cleanEmail);
      } else {
        localStorage.removeItem('veltropay_remembered_email');
      }

      login(res.data.access_token);
      if (isSubdomainSetup) {
        window.location.href = 'https://account.veltrobridge.xyz/home?token=' + encodeURIComponent(res.data.access_token);
      } else {
        window.location.href = '/home?token=' + encodeURIComponent(res.data.access_token);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.detail;
      if (errMsg === 'Email not verified') {
        if (isSubdomainSetup) {
          window.location.href = 'https://login.veltrobridge.xyz/verify?email=' + encodeURIComponent(cleanEmail);
        } else {
          window.location.href = '/verify?email=' + encodeURIComponent(cleanEmail);
        }
      } else {
        setError(errMsg || 'Sign in failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetMessage('');
    try {
      // Send verification/reset email
      await api.post('/auth/resend-verification', { email: resetEmail.trim().toLowerCase() });
      setResetMessage('A recovery verification code has been dispatched to your email address.');
    } catch (err: any) {
      setResetMessage('If an account exists with this email, a security code has been sent.');
    } finally {
      setResetLoading(false);
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
          Sign in to your multi-currency accounts, virtual cards, and instant P2P transfers.
        </p>

        {error && (
          <div className='status-msg status-msg-error' style={{ marginBottom: '1.2rem', marginTop: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className='auth-form'>
          {/* Email Field */}
          <label htmlFor='login-email'>Email Address</label>
          <input 
            id='login-email'
            name='email'
            type='email' 
            autoComplete='email'
            placeholder='name@example.com' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className='form-control-input'
            disabled={loading}
          />

          {/* Password Field with Eye Toggle */}
          <label htmlFor='login-password'>Password</label>
          <div className='password-input-wrapper'>
            <input 
              id='login-password'
              name='password'
              type={showPassword ? 'text' : 'password'} 
              autoComplete='current-password'
              placeholder='••••••••••••' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className='form-control-input'
              disabled={loading}
            />
            <button 
              type='button' 
              className='password-toggle-btn'
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className='material-symbols-outlined' style={{ fontSize: '1.25rem' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Helpers: Remember Me & Forgot Password */}
          <div className='auth-helper-row'>
            <label className='auth-checkbox-label'>
              <input 
                type='checkbox' 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span>Remember me</span>
            </label>

            <button 
              type='button'
              onClick={() => {
                setResetEmail(email);
                setShowForgotModal(true);
              }}
              className='forgot-password-link'
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Action */}
          <button 
            type='submit' 
            disabled={loading}
            className='btn-primary-action'
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <span className='material-symbols-outlined spinner-rotate' style={{ fontSize: '1.2rem' }}>sync</span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className='auth-links'>
          <span>Don&apos;t have an account yet? </span>
          <a href={signupUrl} style={{ fontWeight: 700, color: '#38bdf8' }}>
            Open Free Account
          </a>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className='material-symbols-outlined' style={{ color: '#38bdf8' }}>lock_reset</span>
                Account Recovery
              </h3>
              <button 
                type='button' 
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <span className='material-symbols-outlined'>close</span>
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Enter your email address and we will dispatch a 6-digit verification security code to reset your account credentials.
            </p>

            {resetMessage ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '12px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {resetMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>Account Email</label>
                <input 
                  type='email' 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  placeholder='name@example.com' 
                  required 
                  className='form-control-input'
                  style={{ marginBottom: '1.25rem' }}
                />

                <button 
                  type='submit' 
                  disabled={resetLoading}
                  className='btn-primary-action'
                  style={{ width: '100%' }}
                >
                  {resetLoading ? 'Dispatching...' : 'Send Recovery Code'}
                </button>
              </form>
            )}

            <button 
              type='button' 
              onClick={() => setShowForgotModal(false)}
              style={{ width: '100%', marginTop: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
