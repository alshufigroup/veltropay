import React, { useState, useEffect, useContext } from 'react';
import Card from '../components/Card/Card';
import Layout from '../components/Layout/Layout';
import History from '../components/History/History';
import Divider from '../components/Divider/Divider';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

const Cards: React.FC = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [rawAccNumber, setRawAccNumber] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [cvc, setCvc] = useState<string>('***');
  const [realCvc, setRealCvc] = useState<string>('');
  const [isCvcRevealed, setIsCvcRevealed] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [onlineSpending, setOnlineSpending] = useState<boolean>(true);
  const [expiry, setExpiry] = useState<string>('-- / --');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedField, setCopiedField] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallets/');
        if (res.data && res.data.length > 0) {
          const wallet = res.data[0];
          const acc = wallet.account_number;
          setRawAccNumber(acc);

          // Format the real account number into 4-digit card groups
          const padded = acc.padStart(16, '0');
          setAccountNumber(
            `${padded.substring(0, 4)} ${padded.substring(4, 8)} ${padded.substring(8, 12)} ${padded.substring(12, 16)}`
          );

          setBalance(wallet.balance);
          setCurrency(wallet.currency);

          // Generate a deterministic CVC and expiry from account data
          const hash = acc.split('').reduce((sum: number, c: string) => sum + c.charCodeAt(0), 0);
          const computedCvc = String(100 + (hash % 900));
          setRealCvc(computedCvc);
          setCvc(isCvcRevealed ? computedCvc : '***');
          
          const now = new Date();
          const expiryMonth = String((hash % 12) + 1).padStart(2, '0');
          const expiryYear = String(now.getFullYear() + 3).substring(2);
          setExpiry(`${expiryMonth} / ${expiryYear}`);
        }
      } catch (err) {
        console.error('Failed to fetch wallet for card', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, [isAuthenticated, isCvcRevealed]);

  const toggleRevealCvc = () => {
    const next = !isCvcRevealed;
    setIsCvcRevealed(next);
    setCvc(next ? realCvc : '***');
  };

  const copyCardDetail = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(label);
    setTimeout(() => setCopiedField(''), 2200);
  };

  const cardHolderName = user?.full_name ? user.full_name.toUpperCase() : 'VALUED CUSTOMER';
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

  return (
    <Layout>
      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className='title no-select' style={{ margin: 0 }}>Virtual Debit Card</h1>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          background: isFrozen ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
          border: `1px solid ${isFrozen ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
          color: isFrozen ? '#fca5a5' : '#34d399'
        }}>
          <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>
            {isFrozen ? 'ac_unit' : 'check_circle'}
          </span>
          {isFrozen ? 'Card Frozen' : 'Active • Platinum'}
        </div>
      </div>

      <div className='cards' style={{ opacity: isFrozen ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
        {isLoading ? (
          <div className='card no-select'>
            <div className='card-inner'>
              <div className='front' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className='skeleton' style={{ width: '80%', height: '24px' }} />
              </div>
            </div>
          </div>
        ) : (
          <Card
            number={accountNumber || '**** **** **** ****'}
            cvcNumber={cvc}
            validUntil={expiry}
            cardHolder={cardHolderName}
            balance={balance}
            currencySymbol={symbol}
          />
        )}
      </div>

      {/* Card Quick Management Hub */}
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '18px', padding: '1.25rem', marginTop: '1.25rem' }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className='material-symbols-outlined' style={{ color: '#38bdf8', fontSize: '1.2rem' }}>tune</span>
          Card Controls & Security
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
          {/* Freeze / Unfreeze Toggle */}
          <button
            type='button'
            onClick={() => setIsFrozen(!isFrozen)}
            className='preset-btn'
            style={{
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: isFrozen ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isFrozen ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <span className='material-symbols-outlined' style={{ color: isFrozen ? '#f87171' : '#38bdf8' }}>
              {isFrozen ? 'lock_open' : 'ac_unit'}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{isFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
          </button>

          {/* Reveal CVV Toggle */}
          <button
            type='button'
            onClick={toggleRevealCvc}
            className='preset-btn'
            style={{
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: isCvcRevealed ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <span className='material-symbols-outlined' style={{ color: isCvcRevealed ? '#60a5fa' : '#94a3b8' }}>
              {isCvcRevealed ? 'visibility_off' : 'visibility'}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{isCvcRevealed ? 'Hide CVV' : 'Reveal CVV'}</span>
          </button>

          {/* Online Spending Toggle */}
          <button
            type='button'
            onClick={() => setOnlineSpending(!onlineSpending)}
            className='preset-btn'
            style={{
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className='material-symbols-outlined' style={{ color: onlineSpending ? '#34d399' : '#94a3b8' }}>
              {onlineSpending ? 'public' : 'public_off'}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{onlineSpending ? 'E-Commerce: On' : 'E-Commerce: Off'}</span>
          </button>
        </div>

        {/* 1-Click Copy Details Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <span>Card No: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{accountNumber}</strong></span>
            <span>CVV: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{isCvcRevealed ? realCvc : '•••'}</strong></span>
          </div>
          <button
            type='button'
            onClick={() => copyCardDetail(`${accountNumber.replace(/\s+/g, '')} | EXP: ${expiry} | CVV: ${realCvc}`, 'all')}
            style={{
              background: copiedField === 'all' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.15)',
              border: `1px solid ${copiedField === 'all' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.35)'}`,
              color: copiedField === 'all' ? '#34d399' : '#93c5fd',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>
              {copiedField === 'all' ? 'check' : 'content_copy'}
            </span>
            {copiedField === 'all' ? 'Copied Details!' : 'Copy Details'}
          </button>
        </div>
      </div>

      <Divider />

      <History detailed date='Card Activity' />

      <Divider />
    </Layout>
  );
};

export default Cards;
