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

  const lookupAccount = async () => {
    try {
      setError('');
      setRecipient(null);
      const res = await api.get(`/wallets/lookup/${accountNumber}`);
      setRecipient(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Account not found');
    }
  };

  const sendMoney = async () => {
    try {
      setError('');
      setSuccess('');
      await api.post('/transactions/send', {
        receiver_account: accountNumber,
        amount: parseFloat(amount)
      });
      setSuccess('Money sent successfully!');
      setAmount('');
      setAccountNumber('');
      setRecipient(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send money');
    }
  };

  return (
    <Layout>
      <Divider />
      <h1 className='title no-select'>Send Money (P2P)</h1>
      
      <div className='glass-card-light'>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#4a5568', fontWeight: 600 }}>
          Recipient Account Number
        </label>
        <input 
          type="text" 
          placeholder="e.g. 12345678" 
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className='form-control-input'
        />
        <button 
          onClick={lookupAccount}
          className='btn-secondary-action'
        >
          Lookup Account
        </button>

        {recipient && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#2d3748' }}>Recipient Found:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#3182ce', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {recipient.full_name ? recipient.full_name[0].toUpperCase() : '👤'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#1a202c' }}>{recipient.full_name}</p>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.85rem' }}>Currency: {recipient.currency}</p>
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#4a5568', fontWeight: 600 }}>
              Amount to Send ({recipient.currency})
            </label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='form-control-input'
            />
            <button 
              onClick={sendMoney}
              className='btn-primary-action'
            >
              Send Money Now
            </button>
          </div>
        )}
        
        {error && <div className='status-msg status-msg-error'>{error}</div>}
        {success && <div className='status-msg status-msg-success'>{success}</div>}
      </div>

      <Divider />
      <h1 className='title no-select'>Transaction History</h1>
      <History detailed date='All Transactions' />
      <Divider />
    </Layout>
  );
};

export default Transactions;
