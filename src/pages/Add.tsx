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
  beneficiary: string;
  reference: string;
  status: string;
}

const Add: React.FC = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [kycStatus, setKycStatus] = useState<string>('unverified');
  const [ibanDetails, setIbanDetails] = useState<IbanDetails | null>(null);
  const [copiedKey, setCopiedKey] = useState<string>('');
  
  // Demo funding tab state
  const [activeTab, setActiveTab] = useState<'wire' | 'demo'>('wire');
  const [demoAmount, setDemoAmount] = useState<string>('50');
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

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

  const handleDemoAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(demoAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setError('');
    setMessage('');
    setDemoLoading(true);

    try {
      const res = await api.post(`/wallets/fund_demo?amount=${numAmount}`);
      setCurrentBalance(res.data.new_balance);
      setMessage(`Successfully added ${currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£'}${numAmount.toFixed(2)} to your balance!`);
      setDemoAmount('50');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add money. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Deposit & Add Money</h1>

      {/* Balance Readout */}
      <div className='balance-readout'>
        <p className='label'>Total Available Balance</p>
        <h2 className='value'>
          <span style={{ color: '#93c5fd', fontSize: '1.8rem', marginRight: '4px' }}>{symbol}</span>
          {currentBalance.toFixed(2)}
        </h2>
      </div>

      {/* Method Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <button
          type='button'
          onClick={() => setActiveTab('wire')}
          className={`preset-btn flex-1 ${activeTab === 'wire' ? 'active' : ''}`}
          style={{ padding: '10px 14px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <span className='material-symbols-outlined' style={{ fontSize: '1.2rem' }}>language</span>
          Dedicated SEPA IBAN
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('demo')}
          className={`preset-btn flex-1 ${activeTab === 'demo' ? 'active' : ''}`}
          style={{ padding: '10px 14px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <span className='material-symbols-outlined' style={{ fontSize: '1.2rem' }}>bolt</span>
          Instant Sandbox Top-Up
        </button>
      </div>

      {activeTab === 'wire' && (
        <>
          {ibanDetails ? (
            <div className='iban-card'>
              <div className='iban-header'>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>Your Dedicated SEPA IBAN</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Direct deposit & wire transfer instructions
                  </p>
                </div>
                <div className='iban-badge'>
                  <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>check_circle</span>
                  Active & Verified
                </div>
              </div>

              <div className='iban-detail-grid'>
                <div className='iban-row'>
                  <span className='iban-row-label'>Beneficiary Name</span>
                  <div className='iban-row-value-group'>
                    <span className='iban-row-value'>{ibanDetails.beneficiary || user?.full_name}</span>
                    <button 
                      type='button' 
                      onClick={() => copyToClipboard(ibanDetails.beneficiary || user?.full_name || '', 'name')} 
                      className='btn-copy'
                    >
                      <span className='material-symbols-outlined'>content_copy</span>
                      {copiedKey === 'name' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className='iban-row'>
                  <span className='iban-row-label'>Dedicated IBAN</span>
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
                  <span className='iban-row-label'>Bank Name</span>
                  <div className='iban-row-value-group'>
                    <span className='iban-row-value' style={{ fontSize: '0.88rem' }}>{ibanDetails.bank_name}</span>
                  </div>
                </div>

                <div className='iban-row'>
                  <span className='iban-row-label'>Payment Reference</span>
                  <div className='iban-row-value-group'>
                    <span className='iban-row-value'>{ibanDetails.reference}</span>
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

              <div style={{ marginTop: '1.25rem', padding: '10px 14px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className='material-symbols-outlined' style={{ color: '#60a5fa', fontSize: '1.2rem' }}>info</span>
                <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  Funds wired to this dedicated European IBAN are credited automatically to your wallet via SEPA Instant settlement.
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
                Your identity documents have been submitted securely and are currently under review. Your personal European SEPA IBAN will be provisioned automatically once approved.
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
                To receive external bank wires and assign your dedicated European SEPA IBAN, please complete our rapid identity verification.
              </p>
              <Link to='/profile' className='btn-brand-blue' style={{ display: 'inline-flex' }}>
                Start KYC Verification
              </Link>
            </div>
          )}
        </>
      )}

      {activeTab === 'demo' && (
        <div className='glass-card'>
          <h3 style={{ marginBottom: '0.4rem' }}>Instant Sandbox Top-Up</h3>
          <p style={{ marginBottom: '1.2rem' }}>
            Simulate a real-time card deposit to test instant wallet funding and P2P transfers.
          </p>

          <form onSubmit={handleDemoAddMoney}>
            <label htmlFor='deposit-amount'>
              Deposit Amount ({currency})
            </label>
            <div className='input-row'>
              <span className='prefix'>{symbol}</span>
              <input 
                id='deposit-amount'
                type='number' 
                step='0.01' 
                min='1' 
                value={demoAmount} 
                onChange={(e) => setDemoAmount(e.target.value)} 
                placeholder='0.00' 
                required 
              />
            </div>

            <div className='preset-grid'>
              {['20', '50', '100', '250', '500'].map((preset) => (
                <button
                  type='button'
                  key={preset}
                  onClick={() => setDemoAmount(preset)}
                  className={`preset-btn ${demoAmount === preset ? 'active' : ''}`}
                >
                  +{symbol}{preset}
                </button>
              ))}
            </div>

            <button 
              type='submit' 
              disabled={demoLoading}
              className='btn-primary-action'
            >
              {demoLoading ? 'Processing Deposit...' : 'Add Money Instantly'}
            </button>
          </form>

          {message && <div className='status-msg status-msg-success'>{message}</div>}
          {error && <div className='status-msg status-msg-error'>{error}</div>}
        </div>
      )}

      <Divider />
    </Layout>
  );
};

export default Add;
