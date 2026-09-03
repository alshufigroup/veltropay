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

  // Transaction PIN State
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPinVal, setConfirmPinVal] = useState('');
  const [pinPassword, setPinPassword] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMsg, setPinMsg] = useState('');
  const [pinError, setPinError] = useState('');
  const [accountNumber, setAccountNumber] = useState<string>('');

  const fetchPinStatus = async () => {
    try {
      const res = await api.get('/auth/pin/status');
      setHasPin(res.data.has_pin);
    } catch (err) {
      console.error('Failed to fetch PIN status', err);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [kycRes, pinRes, walletRes] = await Promise.all([
          api.get('/kyc/status'),
          api.get('/auth/pin/status').catch(() => ({ data: { has_pin: false } })),
          api.get('/wallets/').catch(() => ({ data: [] }))
        ]);
        if (kycRes.data) {
          setKycStatus(kycRes.data.kyc_status);
          if (kycRes.data.iban_details) {
            setIbanDetails(kycRes.data.iban_details);
          }
        }
        if (pinRes.data) {
          setHasPin(pinRes.data.has_pin);
        }
        if (walletRes.data && walletRes.data.length > 0) {
          setAccountNumber(walletRes.data[0].account_number);
        }
      } catch (err) {
        console.error('Failed to fetch status', err);
      }
    };

    fetchStatus();
  }, []);

  const handleSetOrUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinMsg('');

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setPinError('PIN must be exactly 6 digits (numbers only).');
      return;
    }

    if (newPin !== confirmPinVal) {
      setPinError('PIN confirmation does not match.');
      return;
    }

    setPinLoading(true);
    try {
      const payload: { pin: string; current_password?: string } = { pin: newPin };
      if (hasPin && pinPassword) {
        payload.current_password = pinPassword;
      }

      await api.post('/auth/pin/set', payload);
      setPinMsg('6-Digit Transaction PIN saved successfully!');
      setHasPin(true);
      setNewPin('');
      setConfirmPinVal('');
      setPinPassword('');
      setShowPinForm(false);
    } catch (err: any) {
      setPinError(err.response?.data?.detail || 'Failed to set Transaction PIN.');
    } finally {
      setPinLoading(false);
    }
  };

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

      {/* Internal VeltroPay Account Details Card */}
      <div className='glass-card' style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(59, 130, 246, 0.35)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className='material-symbols-outlined' style={{ color: '#38bdf8', fontSize: '1.2rem' }}>account_balance_wallet</span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Internal VeltroPay Account</h3>
              <p style={{ margin: '1px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>For instant, zero-fee client-to-client transfers</p>
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
            P2P Instant
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.45, margin: '0.5rem 0 1rem 0' }}>
          Share your 8-digit account number below with other VeltroPay clients to receive instant peer-to-peer transfers into your wallet.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.85)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
              Your 8-Digit Account ID
            </span>
            <span style={{ fontSize: '1.45rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '2.5px', fontFamily: 'monospace', marginTop: '2px' }}>
              {accountNumber || '••••••••'}
            </span>
          </div>
          <button
            type='button'
            onClick={() => copyToClipboard(accountNumber, 'acc_num')}
            className='btn-copy'
            style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>
              {copiedKey === 'acc_num' ? 'check' : 'content_copy'}
            </span>
            {copiedKey === 'acc_num' ? 'Copied!' : 'Copy'}
          </button>
        </div>
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

      {/* Transaction PIN & Security Management Card */}
      <div className='glass-card' style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>2FA Transaction PIN</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              6-digit security code for authorizing transfers and bank withdrawals
            </p>
          </div>
          {hasPin ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
              <span className='material-symbols-outlined' style={{ fontSize: '0.9rem' }}>shield</span>
              Active
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
              <span className='material-symbols-outlined' style={{ fontSize: '0.9rem' }}>lock_clock</span>
              Not Configured
            </span>
          )}
        </div>

        {!showPinForm ? (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
              {hasPin 
                ? 'Your 6-digit PIN is active and safeguarding your outgoing funds.' 
                : 'Protect your account by setting a 6-digit transaction authorization PIN.'}
            </span>
            <button
              type='button'
              onClick={() => setShowPinForm(true)}
              className='btn-secondary-action'
              style={{ minWidth: '120px', marginLeft: '12px' }}
            >
              {hasPin ? 'Change PIN' : 'Set PIN'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSetOrUpdatePin} style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {hasPin && (
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor='current-pwd'>Current Account Password</label>
                <input
                  id='current-pwd'
                  type='password'
                  placeholder='Enter password to authorize change'
                  value={pinPassword}
                  onChange={(e) => setPinPassword(e.target.value)}
                  className='form-control-input'
                  required
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
              <div>
                <label htmlFor='new-pin'>New 6-Digit PIN</label>
                <input
                  id='new-pin'
                  type='password'
                  maxLength={6}
                  inputMode='numeric'
                  placeholder='••••••'
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className='form-control-input'
                  required
                />
              </div>
              <div>
                <label htmlFor='confirm-pin'>Confirm 6-Digit PIN</label>
                <input
                  id='confirm-pin'
                  type='password'
                  maxLength={6}
                  inputMode='numeric'
                  placeholder='••••••'
                  value={confirmPinVal}
                  onChange={(e) => setConfirmPinVal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className='form-control-input'
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type='submit'
                disabled={pinLoading || newPin.length !== 6 || confirmPinVal.length !== 6}
                className='btn-primary-action'
                style={{ flex: 1 }}
              >
                {pinLoading ? 'Saving PIN...' : hasPin ? 'Update PIN' : 'Save 6-Digit PIN'}
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowPinForm(false);
                  setPinError('');
                }}
                className='btn-secondary-action'
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {pinError && <div className='status-msg status-msg-error' style={{ marginTop: '1rem' }}>{pinError}</div>}
        {pinMsg && <div className='status-msg status-msg-success' style={{ marginTop: '1rem' }}>{pinMsg}</div>}
      </div>

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
