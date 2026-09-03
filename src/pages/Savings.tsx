import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import Currency from '../components/Currency/Currency';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

interface Vault {
  id: number;
  user_id: number;
  currency: string;
  balance: number;
  aer_rate: number;
}

const Savings: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletCurrency, setWalletCurrency] = useState<string>('EUR');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchVaults = async () => {
    try {
      const [vaultsRes, walletRes] = await Promise.all([
        api.get('/savings/vaults'),
        api.get('/wallets/')
      ]);
      if (vaultsRes.data) {
        setVaults(vaultsRes.data);
      }
      if (walletRes.data && walletRes.data.length > 0) {
        setWalletBalance(walletRes.data[0].balance);
        setWalletCurrency(walletRes.data[0].currency);
      }
    } catch (err) {
      console.error('Failed to load savings vaults', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchVaults();
  }, [isAuthenticated]);

  const activeVault = vaults.find((v) => v.currency === selectedCurrency);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    setFeedback('');
    setLoading(true);

    try {
      if (actionType === 'deposit') {
        const res = await api.post('/savings/deposit', {
          currency: selectedCurrency,
          amount: numAmount
        });
        setFeedback(res.data?.message || `Deposited ${walletCurrency} ${numAmount.toFixed(2)} into ${selectedCurrency} Vault.`);
      } else {
        if (!activeVault) return;
        const res = await api.post('/savings/withdraw', {
          vault_id: activeVault.id,
          amount: numAmount
        });
        setFeedback(res.data?.message || `Withdrawn ${selectedCurrency} ${numAmount.toFixed(2)} from Vault.`);
      }
      setAmount('');
      fetchVaults();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Operation failed. Please check your balance.');
    } finally {
      setLoading(false);
    }
  };

  const getVaultRate = (curr: string) => {
    const v = vaults.find((vault) => vault.currency === curr);
    return v ? `${v.aer_rate}% AER` : curr === 'GBP' ? '2.29% AER' : curr === 'USD' ? '1.49% AER' : '1.19% AER';
  };

  const getVaultBalance = (curr: string) => {
    const v = vaults.find((vault) => vault.currency === curr);
    return v ? v.balance.toFixed(2) : '0.00';
  };

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>High-Yield Savings Vaults</h1>

      {/* Balance Readout */}
      <div className='balance-readout' style={{ padding: '1rem' }}>
        <p className='label' style={{ fontSize: '0.8rem' }}>Primary Wallet Available</p>
        <h2 className='value' style={{ fontSize: '1.8rem' }}>
          {walletCurrency === 'EUR' ? '€' : walletCurrency === 'USD' ? '$' : '£'} {walletBalance.toFixed(2)}
        </h2>
      </div>

      <p className='information text-shadow' style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        Select a currency vault below to lock funds and earn automated interest.
      </p>

      <div className='history' style={{ marginBottom: '1.25rem' }}>
        <Currency
          aer={`${getVaultRate('GBP')} • Bal: £${getVaultBalance('GBP')}`}
          name='British Pound Vault'
          shortName='GBP'
          active={selectedCurrency === 'GBP'}
          onSelect={() => {
            setSelectedCurrency('GBP');
            setError('');
            setFeedback('');
          }}
        >
          <span className='material-symbols-outlined' style={{ color: '#ffffff', fontSize: '1.4rem' }}>savings</span>
        </Currency>

        <Currency
          aer={`${getVaultRate('USD')} • Bal: $${getVaultBalance('USD')}`}
          name='US Dollar Vault'
          shortName='USD'
          active={selectedCurrency === 'USD'}
          onSelect={() => {
            setSelectedCurrency('USD');
            setError('');
            setFeedback('');
          }}
        >
          <span className='material-symbols-outlined' style={{ color: '#ffffff', fontSize: '1.4rem' }}>savings</span>
        </Currency>

        <Currency
          aer={`${getVaultRate('EUR')} • Bal: €${getVaultBalance('EUR')}`}
          name='Euro Vault'
          shortName='EUR'
          active={selectedCurrency === 'EUR'}
          onSelect={() => {
            setSelectedCurrency('EUR');
            setError('');
            setFeedback('');
          }}
        >
          <span className='material-symbols-outlined' style={{ color: '#ffffff', fontSize: '1.4rem' }}>savings</span>
        </Currency>
      </div>

      <div className='glass-card'>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
          <button
            type='button'
            onClick={() => setActionType('deposit')}
            className={`preset-btn flex-1 ${actionType === 'deposit' ? 'active' : ''}`}
            style={{ padding: '8px' }}
          >
            Deposit to {selectedCurrency} Vault
          </button>
          <button
            type='button'
            onClick={() => setActionType('withdraw')}
            className={`preset-btn flex-1 ${actionType === 'withdraw' ? 'active' : ''}`}
            style={{ padding: '8px' }}
          >
            Withdraw to Wallet
          </button>
        </div>

        <form onSubmit={handleAction}>
          <label htmlFor='vault-amount'>
            Amount to {actionType === 'deposit' ? 'Deposit' : 'Withdraw'} ({selectedCurrency})
          </label>
          <div className='input-row'>
            <span className='prefix'>{selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'USD' ? '$' : '£'}</span>
            <input 
              id='vault-amount'
              type='number' 
              step='0.01' 
              min='0.01' 
              placeholder='0.00'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <button 
            type='submit' 
            disabled={loading}
            className='btn-primary-action'
          >
            {loading ? 'Processing Vault Transfer...' : actionType === 'deposit' ? `Deposit to ${selectedCurrency} Vault` : `Withdraw to Wallet`}
          </button>
        </form>

        {feedback && <div className='status-msg status-msg-success'>{feedback}</div>}
        {error && <div className='status-msg status-msg-error'>{error}</div>}
      </div>

      <Divider />
    </Layout>
  );
};

export default Savings;
