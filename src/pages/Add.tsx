import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

interface IbanDetails {
  iban: string;
  bic: string;
  bank_name: string;
  bank_address?: string;
  beneficiary: string;
  currency?: string;
  instructions?: string;
  reference: string;
  status: string;
}

const Add: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [kycStatus, setKycStatus] = useState<string>('unverified');
  const [ibanDetails, setIbanDetails] = useState<IbanDetails | null>(null);
  const [copiedKey, setCopiedKey] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const [walletRes, kycRes] = await Promise.all([
          api.get('/wallets/'),
          api.get('/kyc/status').catch(() => ({ data: { kyc_status: 'unverified', iban_details: null } }))
        ]);

        if (walletRes.data && walletRes.data.length > 0) {
          setCurrentBalance(walletRes.data[0].balance);
          setCurrency(walletRes.data[0].currency);
        }

        if (kycRes.data) {
          setKycStatus(kycRes.data.kyc_status);
          if (kycRes.data.iban_details) {
            setIbanDetails(kycRes.data.iban_details);
          }
        }
      } catch (err) {
        console.error('Failed to load wallet or KYC status', err);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2200);
  };

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Deposit Funds (SEPA)</h1>

      {/* Balance Readout */}
      <div className='balance-readout'>
        <p className='label'>Current Wallet Balance</p>
        <h2 className='value'>
          <span style={{ color: '#93c5fd', fontSize: '1.8rem', marginRight: '4px' }}>{symbol}</span>
          {currentBalance.toFixed(2)}
        </h2>
      </div>

      {ibanDetails ? (
        <div className='iban-card'>
          <div className='iban-header'>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>SEPA Bank Deposit Instructions</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Make an external SEPA wire transfer using the official details below:
              </p>
            </div>
            <div className='iban-badge'>
              <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>check_circle</span>
              Verified & Active
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

            {ibanDetails.bank_address && (
              <div className='iban-row'>
                <span className='iban-row-label'>Bank Address</span>
                <div className='iban-row-value-group'>
                  <span className='iban-row-value' style={{ fontSize: '0.84rem' }}>{ibanDetails.bank_address}</span>
                </div>
              </div>
            )}

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

          <div style={{ marginTop: '1.25rem', padding: '12px 14px', background: 'rgba(59, 130, 246, 0.12)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span className='material-symbols-outlined' style={{ color: '#60a5fa', fontSize: '1.3rem', marginTop: '1px' }}>info</span>
            <span style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              {ibanDetails.instructions || 'Please send the payment in EUR only. Please carefully include your unique payment reference before confirming the transfer to ensure instant credit.'}
            </span>
          </div>
        </div>
      ) : kycStatus === 'pending' ? (
        <div className='glass-card' style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '2rem', color: '#fbbf24' }}>hourglass_top</span>
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>KYC Verification in Progress</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            Your identity documents have been submitted securely and are currently under review. Your SEPA bank transfer deposit details will be activated automatically once approved.
          </p>
          <Link to='/profile' className='btn-secondary-action'>
            View Verification Status
          </Link>
        </div>
      ) : (
        <div className='glass-card' style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '2rem', color: '#60a5fa' }}>verified_user</span>
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Identity Verification Required</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            To receive external SEPA bank wires and deposit funds directly into your account, please complete our rapid identity verification.
          </p>
          <Link to='/profile' className='btn-brand-blue' style={{ display: 'inline-flex' }}>
            Start KYC Verification
          </Link>
        </div>
      )}

      <Divider />
    </Layout>
  );
};

export default Add;
