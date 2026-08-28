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

      <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', margin: '0 1rem', backdropFilter: 'blur(10px)' }}>
        <p style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '0.9rem' }}>Current Account Balance</p>
        <h2 style={{ fontSize: '2rem', margin: '0 0 1.5rem 0' }}>{symbol} {currentBalance.toFixed(2)}</h2>

        <form onSubmit={handleAddMoney}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
            Enter Amount to Deposit ({currency})
          </label>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '8px', padding: '0.5rem 1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem', color: '#333', fontWeight: 'bold', marginRight: '0.5rem' }}>{symbol}</span>
            <input 
              type="number" 
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1.5rem', color: '#1a202c', fontWeight: 'bold' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['20', '50', '100', '250', '500'].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setAmount(preset)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: amount === preset ? '#3182ce' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                +{symbol}{preset}
              </button>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              backgroundColor: loading ? '#a0aec0' : '#ff8057', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing Deposit...' : 'Add Money Securely'}
          </button>
        </form>

        {message && <p style={{ color: '#4ed34e', marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}
        {error && <p style={{ color: '#f42d53', marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
      </div>

      <Divider />
    </Layout>
  );
};

export default Add;
