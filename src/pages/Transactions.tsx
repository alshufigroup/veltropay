import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout/Layout';
import History from '../components/History/History';
import Divider from '../components/Divider/Divider';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';
import TransactionPinModal from '../components/Security/TransactionPinModal';

const generateIdempotencyKey = () => {
  return `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

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

  // Withdrawal State
  const [wBeneficiary, setWBeneficiary] = useState('');
  const [wIban, setWIban] = useState('');
  const [wBic, setWBic] = useState('');
  const [wAmount, setWAmount] = useState('');
  const [wReference, setWReference] = useState('');
  const [wError, setWError] = useState('');
  const [wSuccess, setWSuccess] = useState('');

  // Primary Wallet
  const [currency, setCurrency] = useState('EUR');
  const [balance, setBalance] = useState(0);
  const [myAccountNumber, setMyAccountNumber] = useState('');
  const [copiedMyAccount, setCopiedMyAccount] = useState(false);

  // PIN Security Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinAction, setPinAction] = useState<'p2p' | 'withdraw'>('p2p');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallets/');
        if (res.data && res.data.length > 0) {
          setCurrency(res.data[0].currency);
          setBalance(res.data[0].balance);
          setMyAccountNumber(res.data[0].account_number);
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

  const handleP2PSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!recipient) {
      setError('Please search and verify the recipient account first');
      return;
    }
    if (numAmount > balance) {
      setError(`Insufficient balance. Available: ${currency} ${balance.toFixed(2)}`);
      return;
    }

    setError('');
    setSuccess('');
    setPinError('');
    setPinAction('p2p');
    setIsPinModalOpen(true);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
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
    if (numAmount > balance) {
      setWError(`Insufficient balance. Available: ${currency} ${balance.toFixed(2)}`);
      return;
    }

    setWError('');
    setWSuccess('');
    setPinError('');
    setPinAction('withdraw');
    setIsPinModalOpen(true);
  };

  const handlePinConfirm = async (pin: string) => {
    setPinLoading(true);
    setPinError('');
    const idempKey = generateIdempotencyKey();

    try {
      if (pinAction === 'p2p') {
        const numAmount = parseFloat(amount);
        await api.post(
          '/transactions/send',
          {
            receiver_account: accountNumber,
            amount: numAmount,
            pin: pin
          },
          {
            headers: { 'Idempotency-Key': idempKey }
          }
        );

        setSuccess(`Successfully transferred ${recipient?.currency || currency} ${numAmount.toFixed(2)} to ${recipient?.full_name}!`);
        setBalance((prev) => Math.max(0, prev - numAmount));
        setAmount('');
        setAccountNumber('');
        setRecipient(null);
        setIsPinModalOpen(false);
      } else {
        const numAmount = parseFloat(wAmount);
        const res = await api.post(
          '/transactions/withdraw',
          {
            beneficiary_name: wBeneficiary,
            iban: wIban,
            bic: wBic,
            amount: numAmount,
            reference: wReference || undefined,
            pin: pin
          },
          {
            headers: { 'Idempotency-Key': idempKey }
          }
        );

        setWSuccess(res.data?.message || `Withdrawal of ${currency} ${numAmount.toFixed(2)} submitted successfully!`);
        setBalance(res.data?.new_balance ?? Math.max(0, balance - numAmount));
        setWAmount('');
        setWIban('');
        setWBic('');
        setWBeneficiary('');
        setWReference('');
        setIsPinModalOpen(false);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Transaction failed. Please verify your PIN.';
      setPinError(errorMsg);
      throw err;
    } finally {
      setPinLoading(false);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Send Money to VeltroPay Account</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>Instant zero-fee transfer to any client account number.</p>
            </div>
            {myAccountNumber && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 10px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Your Acc:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{myAccountNumber}</span>
                <button
                  type='button'
                  onClick={() => {
                    navigator.clipboard.writeText(myAccountNumber);
                    setCopiedMyAccount(true);
                    setTimeout(() => setCopiedMyAccount(false), 2000);
                  }}
                  style={{ background: 'transparent', border: 'none', color: copiedMyAccount ? '#34d399' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 2px' }}
                  title='Copy your account number'
                >
                  <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>{copiedMyAccount ? 'check' : 'content_copy'}</span>
                </button>
              </div>
            )}
          </div>

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
                onClick={handleP2PSubmit}
                className='btn-primary-action'
              >
                {`Transfer ${amount ? (recipient.currency + ' ' + amount) : 'Now'}`}
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

          <form onSubmit={handleWithdrawSubmit}>
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
              className='btn-primary-action'
            >
              {`Withdraw ${wAmount ? symbol + wAmount : 'Funds'} to External Bank`}
            </button>
          </form>

          {wError && <div className='status-msg status-msg-error'>{wError}</div>}
          {wSuccess && <div className='status-msg status-msg-success'>{wSuccess}</div>}
        </div>
      )}

      {/* 2FA Transaction Security PIN Modal */}
      <TransactionPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPinError('');
        }}
        onConfirm={handlePinConfirm}
        title={pinAction === 'p2p' ? 'Authorize P2P Transfer' : 'Authorize Bank Withdrawal'}
        subtitle={
          pinAction === 'p2p'
            ? 'Enter your 6-digit Transaction PIN to complete transfer.'
            : 'Enter your 6-digit Transaction PIN to authorize outward wire transfer.'
        }
        amountDisplay={
          pinAction === 'p2p'
            ? `${recipient?.currency || currency} ${parseFloat(amount || '0').toFixed(2)}`
            : `${currency} ${parseFloat(wAmount || '0').toFixed(2)}`
        }
        recipientDisplay={
          pinAction === 'p2p'
            ? `${recipient?.full_name} (${accountNumber})`
            : `${wBeneficiary} • ${wIban}`
        }
        isLoading={pinLoading}
        errorMessage={pinError}
      />

      <Divider />
      <h2 className='title no-select' style={{ fontSize: '1.35rem' }}>Transaction Activity</h2>
      <History detailed date='Activity Log' />
      <Divider />
    </Layout>
  );
};

export default Transactions;
