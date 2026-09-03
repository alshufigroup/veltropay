import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import History from '../components/History/History';
import Divider from '../components/Divider/Divider';
import { api } from '../api';

const Transactions: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState<{ full_name: string; currency: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSending, setIsSending] = useState(false);

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
      setSuccess(`Successfully sent ${recipient?.currency || ''} ${numAmount.toFixed(2)}!`);
      setAmount('');
      setAccountNumber('');
      setRecipient(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send money');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Layout>
      <Divider />
      <h1 className='title no-select'>Send Money (P2P)</h1>
      
      <div className='glass-card'>
        <label htmlFor='p2p-account' style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
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
                {recipient.full_name ? recipient.full_name[0].toUpperCase() : '👤'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#ffffff', fontSize: '1.05rem' }}>{recipient.full_name}</p>
                <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Wallet Currency: {recipient.currency}</p>
              </div>
            </div>

            <label htmlFor='p2p-amount' style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
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

      <Divider />
      <h2 className='title no-select' style={{ fontSize: '1.35rem' }}>Recent Transfers</h2>
      <History detailed date='Activity Log' />
      <Divider />
    </Layout>
  );
};

export default Transactions;
