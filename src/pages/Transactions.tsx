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
      
      <div style={{ padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px', margin: '0 1rem' }}>
        <input 
          type="text" 
          placeholder="8-Digit Account Number" 
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
        />
        <button 
          onClick={lookupAccount}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4a5568', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          Lookup Account
        </button>

        {recipient && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Recipient Found:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                👤
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{recipient.full_name}</p>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.875rem' }}>Currency: {recipient.currency}</p>
              </div>
            </div>

            <input 
              type="number" 
              placeholder={`Amount in ${recipient.currency}`} 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
            />
            <button 
              onClick={sendMoney}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3182ce', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Send Money
            </button>
          </div>
        )}
        
        {error && <p style={{ color: '#e53e3e', marginTop: '1rem' }}>{error}</p>}
        {success && <p style={{ color: '#38a169', marginTop: '1rem' }}>{success}</p>}
      </div>

      <Divider />
      <h1 className='title no-select'>Transaction History</h1>
      <History detailed date='May 6' dateBalance='-€127.78' />
      <Divider />
    </Layout>
  );
};

export default Transactions;
