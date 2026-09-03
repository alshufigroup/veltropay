import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout/Layout';
import History from '../components/History/History';
import Divider from '../components/Divider/Divider';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

const Transactions: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'p2p' | 'withdraw'>('p2p');

  // P2P State
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState<{ full_name: string; currency: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Withdrawal State
  const [wBeneficiary, setWBeneficiary] = useState('');
  const [wIban, setWIban] = useState('');
  const [wBic, setWBic] = useState('');
  const [wAmount, setWAmount] = useState('');
  const [wReference, setWReference] = useState('');
  const [wLoading, setWLoading] = useState(false);
  const [wError, setWError] = useState('');
  const [wSuccess, setWSuccess] = useState('');

  // Primary Wallet
  const [currency, setCurrency] = useState('EUR');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallets/');
        if (res.data && res.data.length > 0) {
          setCurrency(res.data[0].currency);
          setBalance(res.data[0].balance);
        }
      } catch (err) {
        console.error('Failed to fetch wallet info', err);
      }
    };
    fetchWallet();
  }, [isAuthenticated]);

  const lookupAccount = async () => {
    if (!accountNumber.trim()) {
      setError('Please enter an account number');
      return;
    }
    try {
      setError('');
      setRecipient(null);
      setIsLookingUp(true);
      const res = await api.get(`/wallets/lookup/${accountNumber}`);
      setRecipient(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Account not found');
    } finally {
      setIsLookingUp(false);
    }
  };

  const sendMoney = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      setError('');
      setSuccess('');
      setIsSending(true);
      await api.post('/transactions/send', {
        receiver_account: accountNumber,
        amount: numAmount
      });
      setSuccess(`Successfully sent ${recipient?.currency || ''} ${numAmount.toFixed(2)} to ${recipient?.full_name}!`);
      setBalance((prev) => Math.max(0, prev - numAmount));
      setAmount('');
      setAccountNumber('');
      setRecipient(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send money');
    } finally {
      setIsSending(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(wAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setWError('Please enter a valid amount greater than 0');
      return;
    }
    if (!wBeneficiary.trim() || !wIban.trim() || !wBic.trim()) {
      setWError('Please fill in all recipient banking fields');
      return;
    }

    setWError('');
    setWSuccess('');
    setWLoading(true);

    try {
      const res = await api.post('/transactions/withdraw', {
        beneficiary_name: wBeneficiary,
        iban: wIban,
        bic: wBic,
        amount: numAmount,
        reference: wReference || undefined
      });
      setWSuccess(res.data?.message || `Withdrawal of ${currency} ${numAmount.toFixed(2)} submitted successfully!`);
      setBalance(res.data?.new_balance ?? (balance - numAmount));
      setWAmount('');
      setWIban('');
      setWBic('');
      setWBeneficiary('');
      setWReference('');
    } catch (err: any) {
      setWError(err.response?.data?.detail || 'Failed to submit withdrawal request.');
    } finally {
      setWLoading(false);
    }
  };

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

  return (
    <Layout>
      <Divider />
      <h1 className='title no-select'>Transfers & Payouts</h1>

      {/* Balance Readout */}
      <div className='balance-readout' style={{ padding: '1rem' }}>
        <p className='label' style={{ fontSize: '0.8rem' }}>Available Balance</p>
        <h2 className='value' style={{ fontSize: '1.8rem' }}>
          <span style={{ color: '#93c5fd', fontSize: '1.4rem', marginRight: '4px' }}>{symbol}</span>
          {balance.toFixed(2)}
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <button
          type='button'
          onClick={() => setActiveTab('p2p')}
          className={`preset-btn flex-1 ${activeTab === 'p2p' ? 'active' : ''}`}
          style={{ padding: '10px 14px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <span className='material-symbols-outlined' style={{ fontSize: '1.2rem' }}>send</span>
          P2P Transfer
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('withdraw')}
          className={`preset-btn flex-1 ${activeTab === 'withdraw' ? 'active' : ''}`}
          style={{ padding: '10px 14px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <span className='material-symbols-outlined' style={{ fontSize: '1.2rem' }}>account_balance</span>
          Bank Wire Out (Payout)
        </button>
      </div>

      {activeTab === 'p2p' && (
        <div className='glass-card'>
          <h3 style={{ marginBottom: '0.4rem' }}>Send Money to VeltroPay Account</h3>
          <p style={{ marginBottom: '1.2rem' }}>Instant zero-fee transfer to any client account number.</p>

          <label htmlFor='p2p-account'>
            Recipient Account Number
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <input 
              id='p2p-account'
              type='text' 
              placeholder='e.g. 12345678' 
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className='form-control-input'
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button 
              type='button'
              onClick={lookupAccount}
              disabled={isLookingUp}
              className='btn-secondary-action'
              style={{ minWidth: '100px' }}
            >
              {isLookingUp ? 'Searching...' : 'Lookup'}
            </button>
          </div>

          {recipient && (
            <div style={{ marginTop: '1.25rem', padding: '1.2rem', backgroundColor: 'rgba(30, 41, 59, 0.75)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <p style={{ margin: '0 0 0.75rem 0', fontWeight: 600, color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Recipient Verified
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
                  {recipient.full_name ? recipient.full_name[0].toUpperCase() : (
                    <span className='material-symbols-outlined' style={{ fontSize: '1.4rem' }}>person</span>
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#ffffff', fontSize: '1.05rem' }}>{recipient.full_name}</p>
                  <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Wallet Currency: {recipient.currency}</p>
                </div>
              </div>

              <label htmlFor='p2p-amount'>
                Amount to Transfer ({recipient.currency})
              </label>
              <input 
                id='p2p-amount'
                type='number' 
                step='0.01'
                min='0.01'
                placeholder='0.00' 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='form-control-input'
              />
              <button 
                type='button'
                onClick={sendMoney}
                disabled={isSending}
                className='btn-primary-action'
              >
                {isSending ? 'Sending Transfer...' : `Transfer ${amount ? recipient.currency + ' ' + amount : 'Now'}`}
              </button>
            </div>
          )}
          
          {error && <div className='status-msg status-msg-error'>{error}</div>}
          {success && <div className='status-msg status-msg-success'>{success}</div>}
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className='glass-card'>
          <h3 style={{ marginBottom: '0.4rem' }}>Withdraw to External Bank (SEPA)</h3>
          <p style={{ marginBottom: '1.2rem' }}>
            Transfer funds out of your VeltroPay balance directly to your personal or corporate bank account.
          </p>

          <form onSubmit={handleWithdraw}>
            <label htmlFor='w-name'>Beneficiary Legal Name</label>
            <input 
              id='w-name'
              type='text' 
              placeholder='e.g. John Doe'
              value={wBeneficiary}
              onChange={(e) => setWBeneficiary(e.target.value)}
              required
              className='form-control-input'
            />

            <label htmlFor='w-iban'>External IBAN</label>
            <input 
              id='w-iban'
              type='text' 
              placeholder='e.g. DE89 3704 0044 0532 0130 00'
              value={wIban}
              onChange={(e) => setWIban(e.target.value)}
              required
              className='form-control-input'
            />

            <label htmlFor='w-bic'>BIC / SWIFT Code</label>
            <input 
              id='w-bic'
              type='text' 
              placeholder='e.g. COBADEFFXXX'
              value={wBic}
              onChange={(e) => setWBic(e.target.value)}
              required
              className='form-control-input'
            />

            <label htmlFor='w-amount'>Withdrawal Amount ({currency})</label>
            <div className='input-row'>
              <span className='prefix'>{symbol}</span>
              <input 
                id='w-amount'
                type='number' 
                step='0.01'
                min='1'
                placeholder='0.00'
                value={wAmount}
                onChange={(e) => setWAmount(e.target.value)}
                required
              />
            </div>

            <label htmlFor='w-ref'>Payment Reference (Optional)</label>
            <input 
              id='w-ref'
              type='text' 
              placeholder='e.g. Invoice #1049 or Payout'
              value={wReference}
              onChange={(e) => setWReference(e.target.value)}
              className='form-control-input'
            />

            <button 
              type='submit' 
              disabled={wLoading}
              className='btn-primary-action'
            >
              {wLoading ? 'Submitting Payout...' : `Withdraw ${wAmount ? symbol + wAmount : 'Funds'} to External Bank`}
            </button>
          </form>

          {wError && <div className='status-msg status-msg-error'>{wError}</div>}
          {wSuccess && <div className='status-msg status-msg-success'>{wSuccess}</div>}
        </div>
      )}

      <Divider />
      <h2 className='title no-select' style={{ fontSize: '1.35rem' }}>Transaction Activity</h2>
      <History detailed date='Activity Log' />
      <Divider />
    </Layout>
  );
};

export default Transactions;
