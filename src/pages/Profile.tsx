import React, { useState, useContext } from 'react';
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycMessage, setKycMessage] = useState('');
  const [ibanMessage, setIbanMessage] = useState('');

  const handleKycSubmit = async () => {
    if (!kycFile) return;
    const formData = new FormData();
    formData.append('document', kycFile);
    
    try {
      setKycMessage('Uploading document...');
      await api.post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setKycMessage('KYC submitted successfully. Awaiting verification.');
    } catch (err: any) {
      setKycMessage(err.response?.data?.detail || 'Failed to submit KYC');
    }
  };

  const handleIbanRequest = async () => {
    try {
      setIbanMessage('Requesting SEPA IBAN...');
      await api.post('/kyc/request_iban');
      setIbanMessage('IBAN requested successfully.');
    } catch (err: any) {
      setIbanMessage(err.response?.data?.detail || 'Failed to request IBAN');
    }
  };

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
          {user?.full_name 
            ? user.full_name.trim().split(' ').length >= 2
              ? (user.full_name.trim().split(' ')[0][0] + user.full_name.trim().split(' ')[1][0]).toUpperCase()
              : user.full_name.substring(0, 2).toUpperCase()
            : 'VP'}
        </span>
      </div>
      <div className='center' style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{user?.full_name || 'Valued Client'}</h2>
        <p className='flex flex-v-center flex-h-center' style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          @{user?.email ? user.email.split('@')[0] : 'username'} &nbsp;
          <span className='material-symbols-outlined' style={{ fontSize: '1.2rem', color: '#60a5fa' }}>verified_user</span>
        </p>
      </div>

      <Divider />
      
      <div className='glass-card'>
        <h3 style={{ margin: '0 0 0.4rem 0', fontWeight: 600 }}>KYC Identity Verification</h3>
        <p style={{ marginBottom: '1.2rem' }}>
          Upload your passport, national ID card, or driver&apos;s license for instant real-time verification.
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
          className='btn-brand-blue'
          style={{ width: '100%' }}
        >
          Submit Documents
        </button>
        {kycMessage && <div className='status-msg status-msg-info'>{kycMessage}</div>}
      </div>

      <div className='glass-card'>
        <h3 style={{ margin: '0 0 0.4rem 0', fontWeight: 600 }}>Request Dedicated SEPA IBAN</h3>
        <p style={{ marginBottom: '1.2rem' }}>
          Need to receive external bank wires? Request a dedicated European SEPA IBAN to receive direct deposits.
        </p>
        <button 
          onClick={handleIbanRequest}
          className='btn-secondary-action'
          style={{ width: '100%' }}
        >
          Request Virtual IBAN
        </button>
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
