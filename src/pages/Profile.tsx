import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

interface IbanDetails {
  iban: string;
  bic: string;
  bank_name: string;
  beneficiary: string;
  reference: string;
  status: string;
}

const Profile: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycStatus, setKycStatus] = useState<string>(user?.kyc_status || 'unverified');
  const [ibanDetails, setIbanDetails] = useState<IbanDetails | null>(null);
  const [kycMessage, setKycMessage] = useState('');
  const [ibanMessage, setIbanMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/kyc/status');
        if (res.data) {
          setKycStatus(res.data.kyc_status);
          if (res.data.iban_details) {
            setIbanDetails(res.data.iban_details);
          }
        }
      } catch (err) {
        console.error('Failed to fetch KYC status', err);
      }
    };

    fetchStatus();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2200);
  };

  const handleKycSubmit = async () => {
    if (!kycFile) {
      setKycMessage('Please select a document file first.');
      return;
    }
    const formData = new FormData();
    formData.append('document', kycFile);
    
    setLoading(true);
    setKycMessage('Uploading documents securely...');
    try {
      const res = await api.post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setKycStatus('pending');
      setKycMessage(res.data?.message || 'Documents submitted securely. Identity verification is in progress.');
      setKycFile(null);
    } catch (err: any) {
      setKycMessage(err.response?.data?.detail || 'Failed to submit KYC documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIbanRequest = async () => {
    try {
      setIbanMessage('Provisioning Dedicated SEPA IBAN...');
      const res = await api.post('/kyc/request_iban');
      setIbanMessage(res.data?.message || 'IBAN provisioned successfully.');
      // Refresh status
      const statusRes = await api.get('/kyc/status');
      if (statusRes.data?.iban_details) {
        setIbanDetails(statusRes.data.iban_details);
      }
    } catch (err: any) {
      setIbanMessage(err.response?.data?.detail || 'Failed to request IBAN. Please ensure KYC is verified.');
    }
  };

  const initials = user?.full_name 
    ? user.full_name.trim().split(' ').length >= 2
      ? (user.full_name.trim().split(' ')[0][0] + user.full_name.trim().split(' ')[1][0]).toUpperCase()
      : user.full_name.substring(0, 2).toUpperCase()
    : 'VP';

  return (
    <Layout>
      <Divider />
      <h1 className='title'>Profile & Settings</h1>
      
      <div 
        className='account-photo' 
        style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
        }}
      >
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '2px' }}>
          {initials}
        </span>
      </div>

      <div className='center' style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{user?.full_name || 'Valued Client'}</h2>
        <p className='flex flex-v-center flex-h-center' style={{ color: '#94a3b8', fontSize: '0.92rem', gap: '6px' }}>
          <span>@{user?.email ? user.email.split('@')[0] : 'username'}</span>
          {kycStatus === 'verified' ? (
            <span className='iban-badge' style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '0.9rem' }}>verified</span>
              Verified
            </span>
          ) : kycStatus === 'pending' ? (
            <span className='iban-badge pending' style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '0.9rem' }}>hourglass_top</span>
              KYC Pending
            </span>
          ) : (
            <span className='iban-badge unverified' style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '0.9rem' }}>gpp_maybe</span>
              Unverified
            </span>
          )}
        </p>
      </div>

      <Divider />
      
      {/* KYC Section */}
      <div className='glass-card'>
        <div className='flex flex-space-between flex-v-center' style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontWeight: 600 }}>Identity Verification (KYC)</h3>
          {kycStatus === 'verified' ? (
            <span className='iban-badge'>Verified</span>
          ) : kycStatus === 'pending' ? (
            <span className='iban-badge pending'>Under Review</span>
          ) : (
            <span className='iban-badge unverified'>Required</span>
          )}
        </div>

        {kycStatus === 'verified' ? (
          <p style={{ color: '#6ee7b7' }}>
            Your account is fully verified with Tier-1 banking status. High-limit transfers and dedicated SEPA IBANs are unlocked.
          </p>
        ) : kycStatus === 'pending' ? (
          <p>
            Your identity documents are currently under review. Automated verification is processing and you will be notified once activated.
          </p>
        ) : (
          <>
            <p style={{ marginBottom: '1.2rem' }}>
              Upload your passport, national ID card, or driver&apos;s license for rapid account verification.
            </p>
            <input 
              type='file' 
              accept='image/*,.pdf'
              onChange={(e) => setKycFile(e.target.files ? e.target.files[0] : null)}
              className='form-control-input'
              style={{ cursor: 'pointer' }}
            />
            <button 
              onClick={handleKycSubmit}
              disabled={loading}
              className='btn-brand-blue'
              style={{ width: '100%' }}
            >
              {loading ? 'Submitting Documents...' : 'Submit Verification Documents'}
            </button>
          </>
        )}

        {kycMessage && <div className='status-msg status-msg-info'>{kycMessage}</div>}
      </div>

      {/* Dedicated IBAN Section */}
      <div className='glass-card'>
        <div className='flex flex-space-between flex-v-center' style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontWeight: 600 }}>Dedicated European SEPA IBAN</h3>
          {ibanDetails ? (
            <span className='iban-badge'>Active</span>
          ) : (
            <span className='iban-badge unverified'>Not Provisioned</span>
          )}
        </div>

        {ibanDetails ? (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Your dedicated European IBAN is active. You can receive direct wire transfers from any bank worldwide.
            </p>
            <div className='iban-row' style={{ marginBottom: '8px' }}>
              <span className='iban-row-label'>IBAN</span>
              <div className='iban-row-value-group'>
                <span className='iban-row-value' style={{ color: '#93c5fd' }}>{ibanDetails.iban}</span>
                <button type='button' onClick={() => copyToClipboard(ibanDetails.iban.replace(/\s+/g, ''), 'iban')} className='btn-copy'>
                  <span className='material-symbols-outlined'>content_copy</span>
                  {copiedKey === 'iban' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className='iban-row'>
              <span className='iban-row-label'>BIC/SWIFT</span>
              <div className='iban-row-value-group'>
                <span className='iban-row-value'>{ibanDetails.bic}</span>
                <button type='button' onClick={() => copyToClipboard(ibanDetails.bic, 'bic')} className='btn-copy'>
                  <span className='material-symbols-outlined'>content_copy</span>
                  {copiedKey === 'bic' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: '1.2rem' }}>
              Receive direct deposits and wire transfers via SEPA Instant with a dedicated personal IBAN assigned in your name.
            </p>
            <button 
              onClick={handleIbanRequest}
              disabled={kycStatus !== 'verified'}
              className='btn-secondary-action'
              style={{ width: '100%' }}
            >
              {kycStatus === 'verified' ? 'Generate Dedicated European IBAN' : 'Complete KYC to Unlock IBAN'}
            </button>
          </>
        )}

        {ibanMessage && <div className='status-msg status-msg-info'>{ibanMessage}</div>}
      </div>

      <div className='account'>
        <button onClick={logout} className='flex flex-v-center' style={{ color: '#f43f5e', fontWeight: 600 }}>
          <span className='material-symbols-outlined' style={{ marginRight: '12px' }}>power_settings_new</span>
          Sign Out of Account
        </button>
      </div>

      <Divider />
      <footer className='center no-select'>
        v.1.0.12 • VeltroPay
      </footer>
      <Divider />
    </Layout>
  );
};

export default Profile;
