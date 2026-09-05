import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const AdminGate: React.FC = () => {
  const [email, setEmail] = useState('groupalshufi@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  useEffect(() => {
    // If already logged in with admin credentials, redirect to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.is_admin || res.data?.email?.toLowerCase() === 'groupalshufi@gmail.com') {
            window.location.href = '/portal-admin-master';
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Admin identity identifier required.');
      return;
    }
    if (!password) {
      setError('Root security password required.');
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

      const token = res.data.access_token;
      localStorage.setItem('token', token);
      login(token);

      // Verify admin role via /admin/overview test or /auth/me
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (meRes.data?.is_admin || meRes.data?.email?.toLowerCase() === 'groupalshufi@gmail.com') {
        window.location.href = '/portal-admin-master';
      } else {
        setError('ACCESS DENIED: Account lacks Master Administrative clearance.');
        localStorage.removeItem('token');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Authentication failed. Please verify credentials and root privileges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at top right, #111827 0%, #030712 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Poppins', sans-serif",
      color: '#f9fafb'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(239, 68, 68, 0.1)',
        padding: '36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ef4444, #f59e0b, #3b82f6)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.4))',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            marginBottom: '16px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              admin_panel_settings
            </span>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '100px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            Restricted Master Portal
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            VeltroPay Root Authority
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            Master Command Center & Global Ledger Control
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fca5a5',
            fontSize: '13px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
              Master Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="groupalshufi@gmail.com"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(31, 41, 55, 0.7)',
                  border: '1px solid rgba(75, 85, 99, 0.4)',
                  borderRadius: '12px',
                  padding: '13px 14px 13px 42px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <span className="material-symbols-outlined" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: '20px',
                pointerEvents: 'none'
              }}>
                badge
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
              Master Security Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(31, 41, 55, 0.7)',
                  border: '1px solid rgba(75, 85, 99, 0.4)',
                  borderRadius: '12px',
                  padding: '13px 42px 13px 42px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <span className="material-symbols-outlined" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: '20px',
                pointerEvents: 'none'
              }}>
                lock
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          >
            {loading ? (
              <span>Authenticating Authority...</span>
            ) : (
              <>
                <span>Access Command Center</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(75, 85, 99, 0.3)',
          textAlign: 'center',
          fontSize: '11px',
          color: '#6b7280'
        }}>
          Protected by TLS 1.3 / Cryptographic Token Verification.
          <br />
          Unauthorized access attempts are audited and logged.
        </div>
      </div>
    </div>
  );
};

export default AdminGate;
