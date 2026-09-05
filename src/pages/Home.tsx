import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(true);
  
  const fetchWallets = useCallback(async () => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated, logout]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  // currency symbols helper
  const getSymbol = (curr: string) => {
    if (curr === 'EUR') return '€';
    if (curr === 'USD') return '$';
    if (curr === 'GBP') return '£';
    return curr;
  };

  return (
    <Layout>
      {/* Master Admin Portal Quick Access Bar (Only visible to Master Admin) */}
      {(user?.is_admin || user?.email?.toLowerCase() === 'groupalshufi@gmail.com') && (
        <div style={{
          margin: '0 20px 16px 20px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.3))',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fca5a5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>admin_panel_settings</span>
            <div style={{ fontSize: '13px' }}>
              <strong style={{ color: '#fff' }}>Master Admin Clearance Active</strong> (Root Authority)
            </div>
          </div>
          <a
            href="/portal-admin-master"
            style={{
              background: '#ef4444',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Command Center</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
          </a>
        </div>
      )}

      {/* Account Frozen Alert Banner */}
      {user?.is_frozen && (
        <div style={{
          margin: '0 20px 16px 20px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '16px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          color: '#fca5a5'
        }}>
          <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '24px', flexShrink: 0 }}>
            lock
          </span>
          <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '2px' }}>Account Status: FROZEN</div>
            <div>
              {user.freeze_reason || 'Your account and transactions are currently frozen for compliance review.'}
            </div>
          </div>
        </div>
      )}

      {/* Outbound Transfers Restricted Banner */}
      {user?.transfer_disabled && !user?.is_frozen && (
        <div style={{
          margin: '0 20px 16px 20px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '16px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          color: '#fde68a'
        }}>
          <span className="material-symbols-outlined" style={{ color: '#fbbf24', fontSize: '24px', flexShrink: 0 }}>
            block
          </span>
          <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '2px' }}>Transfers Feature Restricted</div>
            <div>
              {user.transfer_disabled_reason || 'Outbound transfers are disabled on this account by administration.'}
            </div>
          </div>
        </div>
      )}

      <Balance 
        balance={balance} 
        currency={currency} 
        currencySymbol={getSymbol(currency)} 
        accountNumber={accountNumber}
        isLoading={isBalanceLoading} 
        onExchangeSuccess={fetchWallets}
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
