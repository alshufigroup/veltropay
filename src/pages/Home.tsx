import React, { useState, useEffect, useContext } from 'react';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

// components
import Layout from '../components/Layout/Layout';
import Balance from '../components/Balance/Balance';
import Actions from '../components/Actions/Actions';
import History from '../components/History/History';
import Widgets from '../components/Widgets/Widgets';
import Divider from '../components/Divider/Divider';

const Home: React.FC = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchWallets = async () => {
      try {
        const res = await api.get('/wallets/');
        if (res.data && res.data.length > 0) {
          setBalance(res.data[0].balance);
          setCurrency(res.data[0].currency);
          setAccountNumber(res.data[0].account_number);
        }
      } catch (err) {
        console.error('Failed to fetch wallet', err);
        // If 401, they probably have an expired token
        if ((err as any)?.response?.status === 401) {
          logout();
        }
      } finally {
        setIsBalanceLoading(false);
      }
    };
    fetchWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // currency symbols helper
  const getSymbol = (curr: string) => {
    if (curr === 'EUR') return '€';
    if (curr === 'USD') return '$';
    if (curr === 'GBP') return '£';
    return curr;
  };

  return (
    <Layout>
      <Balance 
        balance={balance} 
        currency={currency} 
        currencySymbol={getSymbol(currency)} 
        accountNumber={accountNumber}
        isLoading={isBalanceLoading} 
      />

      <Actions />

      <Divider />

      <History />

      <Divider />

      <Widgets />

      <Divider />
    </Layout>
  );
};

export default Home;
