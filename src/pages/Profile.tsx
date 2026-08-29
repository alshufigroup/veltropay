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
      setKycMessage('Uploading...');
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
      setIbanMessage('Requesting...');
      await api.post('/kyc/request_iban');
      setIbanMessage('IBAN requested successfully.');
    } catch (err: any) {
      setIbanMessage(err.response?.data?.detail || 'Failed to request IBAN');
    }
  };

  return (
    <Layout>
      <Divider />
      <h1 className='title'>Profile</h1>
      <div className='account-photo' style={{ backgroundImage: `url("images/profile.jpg")` }} />
      <div className='center'>
        <h2>{user?.full_name || 'Loading...'}</h2>
        <p className='flex flex-v-center flex-h-center'>
          @{user?.email ? user.email.split('@')[0] : 'username'} &nbsp;
          <span className='material-symbols-outlined'>qr_code</span>
        </p>
      </div>

      <Divider />
      
      <div className='glass-card-light'>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a202c', fontWeight: 600 }}>KYC Verification</h3>
        <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem', lineHeight: 1.5 }}>
          Upload your passport or ID card. This will be securely sent to our Telegram bot for fast, real-time verification.
        </p>
        <input 
          type="file" 
          accept="image/*,.pdf"
          onChange={(e) => setKycFile(e.target.files ? e.target.files[0] : null)}
          className='form-control-input'
        />
        <button 
          onClick={handleKycSubmit}
          className='btn-brand-blue'
        >
          Submit KYC
        </button>
        {kycMessage && <div className='status-msg status-msg-info'>{kycMessage}</div>}
      </div>

      <Divider />

      <div className='glass-card-light'>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a202c', fontWeight: 600 }}>Request External IBAN</h3>
        <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem', lineHeight: 1.5 }}>
          Need to receive SEPA transfers? Request an external IBAN to be assigned to your account manually by our backend team.
        </p>
        <button 
          onClick={handleIbanRequest}
          className='btn-secondary-action'
        >
          Request SEPA IBAN
        </button>
        {ibanMessage && <div className='status-msg status-msg-info'>{ibanMessage}</div>}
      </div>

      <Divider />
      <div className='account'>
        <button onClick={logout} className='flex flex-v-center' style={{ color: '#f87171' }}>
          <span className='material-symbols-outlined' style={{ marginRight: '12px' }}>power_settings_new</span>
          Sign out
        </button>
      </div>
      <Divider />
      <footer className='center no-select'>
        v.1.0.12<br />Veltropay bridge
      </footer>
      <Divider />
    </Layout>
  );
};

export default Profile;
