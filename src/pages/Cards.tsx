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
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [cvc, setCvc] = useState<string>('***');
  const [expiry, setExpiry] = useState<string>('-- / --');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallets/');
        if (res.data && res.data.length > 0) {
          const wallet = res.data[0];
          const acc = wallet.account_number;

          // Format the real account number into 4-digit card groups
          const padded = acc.padStart(16, '0');
          setAccountNumber(
            `${padded.substring(0, 4)} ${padded.substring(4, 8)} ${padded.substring(8, 12)} ${padded.substring(12, 16)}`
          );

          setBalance(wallet.balance);
          setCurrency(wallet.currency);

          // Generate a deterministic CVC and expiry from account data
          const hash = acc.split('').reduce((sum: number, c: string) => sum + c.charCodeAt(0), 0);
          setCvc(String(100 + (hash % 900)));
          
          // Expiry: set 3 years from account creation or a reasonable date
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
  }, [isAuthenticated]);

  const cardHolderName = user?.full_name ? user.full_name.toUpperCase() : 'VALUED CUSTOMER';
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Virtual Debit Card</h1>

      <div className='cards'>
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

      <Divider />

      <History detailed date='Card Activity' />

      <Divider />
    </Layout>
  );
};

export default Cards;
