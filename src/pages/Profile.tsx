import React, { useState, useEffect, useContext, useRef } from 'react';
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
  const { user, logout, updateUser } = useContext(AuthContext);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycStatus, setKycStatus] = useState<string>(user?.kyc_status || 'unverified');
  const [ibanDetails, setIbanDetails] = useState<IbanDetails | null>(null);
  const [kycMessage, setKycMessage] = useState('');
  const [ibanMessage, setIbanMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setAvatarLoading(true);
    setAvatarMsg('Uploading photo to secure storage...');

    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data) {
        updateUser(res.data);
        setAvatarMsg('Profile photo updated successfully!');
        setTimeout(() => setAvatarMsg(''), 3000);
      }
    } catch (err: any) {
      setAvatarMsg(err.response?.data?.detail || 'Failed to upload photo. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
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
      
      {/* Interactive Avatar Container */}
      <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1rem auto' }}>
        <div 
          className='account-photo' 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
          title='Click to change profile photo'
        >
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.full_name || 'Profile'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <span style={{ fontSize: '2.3rem', fontWeight: 700, color: '#ffffff', letterSpacing: '2px' }}>
              {initials}
            </span>
          )}

          {avatarLoading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className='material-symbols-outlined' style={{ animation: 'spin 1s linear infinite', color: '#60a5fa' }}>sync</span>
            </div>
          )}
        </div>

        {/* Camera Overlay Icon */}
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#3b82f6',
            border: '2px solid #0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}
          title='Change profile photo'
        >
          <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>photo_camera</span>
        </button>

        <input 
          ref={fileInputRef} 
          type='file' 
          accept='image/jpeg,image/png,image/webp' 
          style={{ display: 'none' }} 
          onChange={handleAvatarChange}
        />
      </div>

      {avatarMsg && (
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: avatarMsg.includes('success') ? '#10b981' : '#93c5fd', margin: '-0.5rem 0 1rem 0' }}>
          {avatarMsg}
        </p>
      )}

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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
              <span className='material-symbols-outlined' style={{ fontSize: '0.9rem' }}>hourglass_top</span>
              Pending Review
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
              <span className='material-symbols-outlined' style={{ fontSize: '0.9rem' }}>warning</span>
              Unverified
            </span>
          )}
        </p>
      </div>

      {/* Dedicated IBAN Information Card */}
      {ibanDetails ? (
        <div className='iban-card' style={{ marginBottom: '1.5rem' }}>
          <div className='iban-header'>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>Dedicated SEPA IBAN</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Your dedicated European bank account details:
              </p>
            </div>
            <div className='iban-badge'>
              <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>check_circle</span>
              Active
            </div>
          </div>

          <div className='iban-detail-grid'>
            <div className='iban-row'>
              <span className='iban-row-label'>Beneficiary Name</span>
              <div className='iban-row-value-group'>
                <span className='iban-row-value'>{ibanDetails.beneficiary}</span>
                <button 
                  type='button' 
                  onClick={() => copyToClipboard(ibanDetails.beneficiary, 'name')} 
                  className='btn-copy'
                >
                  <span className='material-symbols-outlined'>content_copy</span>
                  {copiedKey === 'name' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className='iban-row'>
              <span className='iban-row-label'>Bank Name</span>
              <div className='iban-row-value-group'>
                <span className='iban-row-value'>{ibanDetails.bank_name}</span>
              </div>
            </div>

            <div className='iban-row'>
              <span className='iban-row-label'>IBAN</span>
              <div className='iban-row-value-group'>
                <span className='iban-row-value' style={{ color: '#93c5fd' }}>{ibanDetails.iban}</span>
                <button 
                  type='button' 
                  onClick={() => copyToClipboard(ibanDetails.iban.replace(/\s+/g, ''), 'iban')} 
                  className='btn-copy'
                >
                  <span className='material-symbols-outlined'>content_copy</span>
                  {copiedKey === 'iban' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className='iban-row'>
              <span className='iban-row-label'>BIC / SWIFT</span>
              <div className='iban-row-value-group'>
                <span className='iban-row-value'>{ibanDetails.bic}</span>
                <button 
                  type='button' 
                  onClick={() => copyToClipboard(ibanDetails.bic, 'bic')} 
                  className='btn-copy'
                >
                  <span className='material-symbols-outlined'>content_copy</span>
                  {copiedKey === 'bic' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className='iban-row'>
              <span className='iban-row-label'>Payment Reference / Note</span>
              <div className='iban-row-value-group'>
                <span className='iban-row-value' style={{ color: '#ff8057' }}>{ibanDetails.reference}</span>
                <button 
                  type='button' 
                  onClick={() => copyToClipboard(ibanDetails.reference, 'ref')} 
                  className='btn-copy'
                >
                  <span className='material-symbols-outlined'>content_copy</span>
                  {copiedKey === 'ref' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : kycStatus === 'verified' ? (
        <div className='glass-card' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Dedicated European IBAN</h3>
          <p style={{ marginBottom: '1rem' }}>
            Your identity verification is complete. Tap below to activate your dedicated SEPA deposit account.
          </p>
          <button 
            type='button' 
            onClick={handleIbanRequest}
            className='btn-primary-action'
            style={{ width: 'auto', display: 'inline-flex', padding: '10px 24px' }}
          >
            Activate Dedicated IBAN
          </button>
          {ibanMessage && <div className='status-msg status-msg-success' style={{ marginTop: '1rem' }}>{ibanMessage}</div>}
        </div>
      ) : null}

      {/* KYC Verification Upload Card */}
      {kycStatus !== 'verified' && (
        <div className='glass-card' style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.4rem' }}>
            {kycStatus === 'pending' ? 'Verification In Progress' : 'Identity Verification (KYC)'}
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            {kycStatus === 'pending' 
              ? 'Your documents have been submitted securely and are currently being reviewed by compliance. We will notify you once complete.'
              : 'Upload a government-issued ID (Passport, National ID, Driver’s License) to unlock SEPA bank transfers and full account capabilities.'}
          </p>

          {kycStatus !== 'pending' && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <input 
                  type='file' 
                  accept='image/*,application/pdf' 
                  onChange={(e) => setKycFile(e.target.files ? e.target.files[0] : null)}
                  style={{ display: 'none' }}
                  id='kyc-upload-input'
                />
                <label 
                  htmlFor='kyc-upload-input'
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.75rem',
                    borderRadius: '14px',
                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                    background: 'rgba(15, 23, 42, 0.4)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <span className='material-symbols-outlined' style={{ fontSize: '2rem', color: '#60a5fa', marginBottom: '6px' }}>
                    cloud_upload
                  </span>
                  <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.92rem' }}>
                    {kycFile ? kycFile.name : 'Choose ID Document (JPEG, PNG, PDF)'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                    Maximum file size 10MB
                  </span>
                </label>
              </div>

              <button 
                type='button' 
                onClick={handleKycSubmit}
                disabled={loading || !kycFile}
                className='btn-primary-action'
              >
                {loading ? 'Uploading Securely...' : 'Submit ID for Verification'}
              </button>
            </div>
          )}

          {kycMessage && (
            <div className={`status-msg ${kycMessage.includes('securely') || kycMessage.includes('progress') ? 'status-msg-success' : 'status-msg-error'}`} style={{ marginTop: '1rem' }}>
              {kycMessage}
            </div>
          )}
        </div>
      )}

      {/* Account Settings / Actions */}
      <div className='glass-card' style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.4rem' }}>Account Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: '#94a3b8' }}>Email Address</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{user?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: '#94a3b8' }}>Account Status</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ color: '#94a3b8' }}>Security</span>
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>2-Factor Protected</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button 
          type='button' 
          onClick={logout}
          className='btn-secondary-action'
          style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)' }}
        >
          Sign Out of VeltroPay
        </button>
      </div>

      <Divider />
    </Layout>
  );
};

export default Profile;
