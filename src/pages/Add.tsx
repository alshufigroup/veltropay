import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

const Add: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [amount, setAmount] = useState<string>('50');
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallets/');
        if (res.data && res.data.length > 0) {
          setCurrentBalance(res.data[0].balance);
          setCurrency(res.data[0].currency);
        }
      } catch (err) {
        console.error('Failed to fetch wallet', err);
      }
    };

    fetchWallet();
  }, [isAuthenticated]);

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post(`/wallets/fund_demo?amount=${numAmount}`);
      setCurrentBalance(res.data.new_balance);
      setMessage(`Successfully added ${currency === 'EUR' ? '€' : '$'}${numAmount.toFixed(2)} to your balance!`);
      setAmount('50');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add money. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Add Money</h1>

      <div className='glass-card'>
        <p className='information' style={{ marginBottom: '0.35rem', opacity: 0.85, fontSize: '0.9rem' }}>Current Account Balance</p>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '1.25rem', fontWeight: 700 }}>{symbol} {currentBalance.toFixed(2)}</h2>

        <form onSubmit={handleAddMoney}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
            Enter Amount to Deposit ({currency})
          </label>
          <div className='input-row'>
            <span className='prefix'>{symbol}</span>
            <input 
              type="number" 
              step="0.01" 
              min="1" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0.00" 
              required 
            />
          </div>

          <div className='preset-grid'>
            {['20', '50', '100', '250', '500'].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setAmount(preset)}
                className={`preset-btn ${amount === preset ? 'active' : ''}`}
              >
                +{symbol}{preset}
              </button>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className='btn-primary-action'
          >
            {loading ? 'Processing Deposit...' : 'Add Money Securely'}
          </button>
        </form>

        {message && <div className='status-msg status-msg-success'>{message}</div>}
        {error && <div className='status-msg status-msg-error'>{error}</div>}
      </div>

      <Divider />
    </Layout>
  );
};

export default Add;
