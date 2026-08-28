import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import { api } from '../api';

const Profile: React.FC = () => {
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
        <h2>Cenk SARI</h2>
        <p className='flex flex-v-center flex-h-center'>
          @cenksari &nbsp;
          <span className='material-symbols-outlined'>qr_code</span>
        </p>
      </div>

      <Divider />
      
      <div style={{ padding: '1rem', margin: '0 1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>KYC Verification</h3>
        <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem' }}>
          Upload your passport or ID card. This will be securely sent to our Telegram bot for fast, real-time verification.
        </p>
        <input 
          type="file" 
          accept="image/*,.pdf"
          onChange={(e) => setKycFile(e.target.files ? e.target.files[0] : null)}
          style={{ marginBottom: '1rem', width: '100%' }}
        />
        <button 
          onClick={handleKycSubmit}
          style={{ padding: '0.75rem', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Submit KYC
        </button>
        {kycMessage && <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#2b6cb0' }}>{kycMessage}</p>}
      </div>

      <Divider />

      <div style={{ padding: '1rem', margin: '0 1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Request External IBAN</h3>
        <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem' }}>
          Need to receive SEPA transfers? Request an external IBAN to be assigned to your account manually by our backend team.
        </p>
        <button 
          onClick={handleIbanRequest}
          style={{ padding: '0.75rem', backgroundColor: '#4a5568', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Request SEPA IBAN
        </button>
        {ibanMessage && <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#2b6cb0' }}>{ibanMessage}</p>}
      </div>

      <Divider />
      <div className='account'>
        <Link to='/profile' className='flex flex-v-center'>
          <span className='material-symbols-outlined'>power_settings_new</span>
          Sign out
        </Link>
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
