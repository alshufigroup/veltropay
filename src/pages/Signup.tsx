import React, { useState } from 'react';
import { api } from '../api';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSubdomainSetup = typeof window !== 'undefined' && window.location.hostname.endsWith('veltrobridge.xyz');
  const loginUrl = isSubdomainSetup ? 'https://login.veltrobridge.xyz' : '/login';
  const marketingUrl = isSubdomainSetup ? 'https://veltrobridge.xyz' : '/';

  // Calculate password strength score (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#f43f5e', '#fb7185', '#fbbf24', '#38bdf8', '#34d399'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('Please provide your full legal name.');
      return;
    }

    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: cleanName,
        email: cleanEmail,
        password,
        currency
      });

      if (isSubdomainSetup) {
        window.location.href = 'https://login.veltrobridge.xyz/verify?email=' + encodeURIComponent(cleanEmail);
      } else {
        window.location.href = '/verify?email=' + encodeURIComponent(cleanEmail);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again with a different email.');
    } finally {
      setLoading(false);
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
          Create your free multi-currency account in seconds and unlock borderless banking.
        </p>

        {error && (
          <div className='status-msg status-msg-error' style={{ marginBottom: '1.2rem', marginTop: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className='auth-form'>
          {/* Full Name */}
          <label htmlFor='signup-name'>Full Legal Name</label>
          <input 
            id='signup-name'
            name='name'
            type='text' 
            autoComplete='name'
            placeholder='e.g. Alexander Wright' 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
            className='form-control-input'
            disabled={loading}
          />

          {/* Email Address */}
          <label htmlFor='signup-email'>Email Address</label>
          <input 
            id='signup-email'
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

          {/* Password */}
          <label htmlFor='signup-password'>Password (8+ characters)</label>
          <div className='password-input-wrapper'>
            <input 
              id='signup-password'
              name='new-password'
              type={showPassword ? 'text' : 'password'} 
              autoComplete='new-password'
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

          {/* Live Password Strength Meter */}
          {password.length > 0 && (
            <div className='strength-meter'>
              <div className='strength-bar-track'>
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step} 
                    className='strength-bar-segment'
                    style={{
                      backgroundColor: strengthScore >= step ? strengthColors[strengthScore] : 'transparent'
                    }}
                  />
                ))}
              </div>
              <div className='strength-label'>
                <span>Strength: <strong style={{ color: strengthColors[strengthScore] }}>{strengthLabels[strengthScore]}</strong></span>
                {password.length < 8 && <span style={{ color: '#fb7185' }}>Min 8 chars required</span>}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <label htmlFor='signup-confirm-password'>Confirm Password</label>
          <div className='password-input-wrapper'>
            <input 
              id='signup-confirm-password'
              name='confirm-password'
              type={showConfirmPassword ? 'text' : 'password'} 
              autoComplete='new-password'
              placeholder='••••••••••••' 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className='form-control-input'
              disabled={loading}
            />
            <button 
              type='button' 
              className='password-toggle-btn'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <span className='material-symbols-outlined' style={{ fontSize: '1.25rem' }}>
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {confirmPassword.length > 0 && password !== confirmPassword && (
            <div style={{ fontSize: '0.78rem', color: '#fb7185', marginTop: '-6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '0.95rem' }}>close</span>
              Passwords do not match
            </div>
          )}

          {/* Primary Currency */}
          <label htmlFor='signup-currency'>Primary Vault Currency</label>
          <select 
            id='signup-currency'
            name='currency'
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)} 
            className='form-select'
            disabled={loading}
          >
            <option value='EUR'>💶 Euro (EUR - €) • SEPA Supported</option>
            <option value='USD'>💵 US Dollar (USD - $) • Global Fedwire</option>
            <option value='GBP'>💷 British Pound (GBP - £) • Faster Payments</option>
          </select>

          {/* Terms & Privacy Consent */}
          <div style={{ marginBottom: '1.5rem', marginTop: '4px' }}>
            <label className='auth-checkbox-label' style={{ alignItems: 'flex-start' }}>
              <input 
                type='checkbox' 
                checked={agreeTerms} 
                onChange={(e) => setAgreeTerms(e.target.checked)} 
                required 
                style={{ marginTop: '3px' }}
              />
              <span style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                I agree to the <span style={{ color: '#38bdf8' }}>Terms of Service</span> and acknowledge the <span style={{ color: '#38bdf8' }}>Privacy Policy</span>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type='submit' 
            disabled={loading}
            className='btn-primary-action'
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <span className='material-symbols-outlined spinner-rotate' style={{ fontSize: '1.2rem' }}>sync</span>
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <span>Open Free Account</span>
                <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className='auth-links'>
          <span>Already have an account? </span>
          <a href={loginUrl} style={{ fontWeight: 700, color: '#38bdf8' }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
