import React, { useState } from 'react';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('EUR');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, call API
    console.log('Signup with', fullName, email, password, currency);
    // On success, redirect to account.veltrobridge.xyz
    window.location.href = 'https://login.veltrobridge.xyz';
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
          <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sign Up
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <a href="https://login.veltrobridge.xyz" style={{ color: '#3182ce' }}>Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
