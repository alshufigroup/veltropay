import React, { useState } from 'react';
import { api } from '../api';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      window.location.href = 'https://login.veltrobridge.xyz';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', margin: '2rem 0' }}>
        <h1 style={{ marginBottom: '1.5rem', color: '#1a202c', textAlign: 'center' }}>Join Veltrobridge</h1>
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
          />
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
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)} 
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e0', backgroundColor: 'white' }}
          >
            <option value="EUR">Euro (EUR)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="GBP">British Pound (GBP)</option>
          </select>
          <button disabled={loading} type="submit" style={{ padding: '0.75rem', backgroundColor: loading ? '#a0aec0' : '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        {error && <p style={{ color: '#e53e3e', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <a href="https://login.veltrobridge.xyz" style={{ color: '#3182ce' }}>Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
