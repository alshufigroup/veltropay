import React, { useState, useEffect, useContext } from 'react';
import Card from '../components/Card/Card';
import Layout from '../components/Layout/Layout';
import History from '../components/History/History';
import Divider from '../components/Divider/Divider';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

const Cards: React.FC = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [accountNumber, setAccountNumber] = useState<string>('4000 1234 5678 9010');
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallets/');
        if (res.data && res.data.length > 0) {
          const acc = res.data[0].account_number;
          // Format 8 digit account number into card-like spacing: 4000 8888 8888 1234
          setAccountNumber(`4000 8888 ${acc.substring(0, 4)} ${acc.substring(4)}`);
          setBalance(res.data[0].balance);
          setCurrency(res.data[0].currency);
        }
      } catch (err) {
        console.error('Failed to fetch wallet for card', err);
      }
    };

    fetchWallet();
  }, [isAuthenticated]);

  const cardHolderName = user?.full_name ? user.full_name.toUpperCase() : 'VALUED CUSTOMER';

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Virtual Debit Card</h1>

      <div className='cards'>
        <Card
          number={accountNumber}
          cvcNumber='482'
          validUntil='12 / 28'
          cardHolder={cardHolderName}
        />
      </div>

      <Divider />

      <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', margin: '0 1rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Available Card Balance</p>
        <h2 style={{ fontSize: '1.8rem', margin: '0.25rem 0' }}>{currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£'} {balance.toFixed(2)}</h2>
      </div>

      <Divider />

      <History detailed date='Card Transactions' />

      <Divider />
    </Layout>
  );
};

export default Cards;
