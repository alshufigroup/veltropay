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

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

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
          balance={balance}
          currencySymbol={symbol}
        />
      </div>

      <Divider />

      <History detailed date='Card Activity' />

      <Divider />
    </Layout>
  );
};

export default Cards;
