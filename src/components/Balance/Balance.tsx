import React, { useState } from 'react';
import { api } from '../../api';

// interfaces
interface IProps {
  balance: number;
  currency: string;
  currencySymbol: string;
  accountNumber?: string;
  isLoading?: boolean;
  onExchangeSuccess?: () => void;
}

const Balance: React.FC<IProps> = ({ 
  balance, 
  currency, 
  currencySymbol, 
  accountNumber, 
  isLoading = false,
  onExchangeSuccess 
}) => {
  const [copied, setCopied] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  
  // Exchange state
  const [toCurrency, setToCurrency] = useState<'EUR' | 'USD' | 'GBP'>('USD');
  const [exchangeAmount, setExchangeAmount] = useState<string>('');
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeError, setExchangeError] = useState('');
  const [exchangeSuccess, setExchangeSuccess] = useState('');

  const rates: Record<string, Record<string, number>> = {
    EUR: { USD: 1.085, GBP: 0.855, EUR: 1.0 },
    USD: { EUR: 0.921, GBP: 0.788, USD: 1.0 },
    GBP: { EUR: 1.169, USD: 1.269, GBP: 1.0 },
  };

  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExchangeError('');
    setExchangeSuccess('');

    const num = parseFloat(exchangeAmount);
    if (isNaN(num) || num <= 0) {
      setExchangeError('Please enter a valid amount to convert.');
      return;
    }
    if (num > balance) {
      setExchangeError(`Insufficient balance. Available: ${currency} ${balance.toFixed(2)}`);
      return;
    }
    if (currency === toCurrency) {
      setExchangeError('Source and target currency must be different.');
      return;
    }

    setExchangeLoading(true);
    try {
      const res = await api.post('/wallets/exchange', {
        from_currency: currency,
        to_currency: toCurrency,
        amount: num
      });
      setExchangeSuccess(res.data?.message || `Successfully converted ${currency} ${num.toFixed(2)} to ${toCurrency}.`);
      setExchangeAmount('');
      if (onExchangeSuccess) {
        onExchangeSuccess();
      }
      setTimeout(() => {
        setShowExchangeModal(false);
        setExchangeSuccess('');
      }, 2000);
    } catch (err: any) {
      setExchangeError(err.response?.data?.detail || 'Currency conversion failed. Please try again.');
    } finally {
      setExchangeLoading(false);
    }
  };

  const numExchangeAmount = parseFloat(exchangeAmount) || 0;
  const targetRate = rates[currency]?.[toCurrency] || 1;
  const estimatedReceive = (numExchangeAmount * targetRate).toFixed(2);

  return (
    <div className='balance flex flex-col flex-v-center flex-h-center'>
      {/* Clickable Currency Selector */}
      <button 
        type='button'
        onClick={() => {
          setToCurrency(currency === 'EUR' ? 'USD' : 'EUR');
          setShowExchangeModal(true);
        }}
        className='currency text-shadow no-select flex flex-v-center flex-h-center'
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        title='Click to convert or switch vault currency'
      >
        <span>Main - {currency}</span>
        <span className='material-symbols-outlined' style={{ fontSize: '1.2rem', marginLeft: '4px' }}>swap_horiz</span>
      </button>

      {/* Main Balance Display */}
      <h1 className='text-shadow no-select flex flex-h-center flex-v-center'>
        {isLoading ? (
          <div className='skeleton skeleton-balance' />
        ) : (
          <>
            <span>{currencySymbol}</span>
            {typeof balance === 'number' ? balance.toFixed(2) : balance}
          </>
        )}
      </h1>

      {/* Internal Account Copy Pill */}
      {accountNumber && !isLoading && (
        <button
          type='button'
          onClick={handleCopyAccount}
          className='account-number-pill'
          title='Click to copy your internal account number'
        >
          <span className='material-symbols-outlined' style={{ fontSize: '0.95rem', color: '#60a5fa' }}>
            account_balance_wallet
          </span>
          <span>Acc: <strong>{accountNumber}</strong></span>
          <span className='material-symbols-outlined' style={{ fontSize: '0.9rem', color: copied ? '#34d399' : '#94a3b8' }}>
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied && <span style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 700, marginLeft: '2px' }}>Copied!</span>}
        </button>
      )}

      {/* Instant Currency Exchange Modal */}
      {showExchangeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '24px', padding: '2rem', maxWidth: '420px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className='material-symbols-outlined' style={{ color: '#38bdf8' }}>currency_exchange</span>
                Instant FX Conversion
              </h3>
              <button 
                type='button' 
                onClick={() => setShowExchangeModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <span className='material-symbols-outlined'>close</span>
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Convert balance instantly at mid-market rates with synchronized wallet credit.
            </p>

            {exchangeError && (
              <div className='status-msg status-msg-error' style={{ marginBottom: '1rem', marginTop: 0, fontSize: '0.85rem' }}>
                {exchangeError}
              </div>
            )}

            {exchangeSuccess && (
              <div className='status-msg status-msg-success' style={{ marginBottom: '1rem', marginTop: 0, fontSize: '0.85rem' }}>
                {exchangeSuccess}
              </div>
            )}

            <form onSubmit={handleExchangeSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Amount to Convert (Available: {currencySymbol} {balance.toFixed(2)})
                </label>
                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.12)', overflow: 'hidden' }}>
                  <input 
                    type='number' 
                    step='0.01'
                    min='0.01'
                    max={balance}
                    placeholder='0.00'
                    value={exchangeAmount} 
                    onChange={(e) => setExchangeAmount(e.target.value)} 
                    required 
                    style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 14px', color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, outline: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', background: 'rgba(30, 41, 59, 0.8)', color: '#93c5fd', fontWeight: 700 }}>
                    {currency}
                  </div>
                </div>
              </div>

              {/* Rate Indicator */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.76rem', color: '#93c5fd', fontWeight: 600 }}>
                  1 {currency} = {targetRate} {toCurrency}
                </div>
              </div>

              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Convert To Currency
                </label>
                <select 
                  value={toCurrency} 
                  onChange={(e) => setToCurrency(e.target.value as any)} 
                  className='form-select'
                  style={{ marginBottom: '6px' }}
                >
                  {currency !== 'EUR' && <option value='EUR'>💶 Euro (EUR - €)</option>}
                  {currency !== 'USD' && <option value='USD'>💵 US Dollar (USD - $)</option>}
                  {currency !== 'GBP' && <option value='GBP'>💷 British Pound (GBP - £)</option>}
                </select>

                {numExchangeAmount > 0 && (
                  <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600, textAlign: 'right' }}>
                    You will receive ≈ {toCurrency === 'EUR' ? '€' : toCurrency === 'USD' ? '$' : '£'} {estimatedReceive}
                  </div>
                )}
              </div>

              <button 
                type='submit' 
                disabled={exchangeLoading || !exchangeAmount}
                className='btn-primary-action'
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {exchangeLoading ? (
                  <>
                    <span className='material-symbols-outlined spinner-rotate' style={{ fontSize: '1.2rem' }}>sync</span>
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <span>Convert Now</span>
                    <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Balance;
