import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import HistoryLine from './HistoryLine';
import ReceiptModal, { TransactionDetails } from './ReceiptModal';
import { api } from '../../api';
import { AuthContext } from '../../context/AuthContext';

interface TransactionResponse {
  id: number;
  sender_account: string;
  receiver_account: string;
  amount: number;
  currency: string;
  tx_type?: string;
  description?: string;
  timestamp: string;
  status: string;
}

interface IProps {
  date?: string;
  detailed?: boolean;
  dateBalance?: string;
}

const History: React.FC<IProps> = ({
  date = undefined,
  detailed = false,
  dateBalance = undefined,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [userAccount, setUserAccount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchHistoryAndWallet = async () => {
      try {
        const [historyRes, walletRes] = await Promise.all([
          api.get('/transactions/history'),
          api.get('/wallets/').catch(() => ({ data: [] }))
        ]);

        setTransactions(historyRes.data);
        if (walletRes.data && walletRes.data.length > 0) {
          setUserAccount(walletRes.data[0].account_number);
        }
      } catch (err) {
        console.error('Failed to fetch transaction history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryAndWallet();
  }, [isAuthenticated]);

  const getCurrencySymbol = (curr: string) => {
    if (curr === 'EUR') return '€';
    if (curr === 'USD') return '$';
    if (curr === 'GBP') return '£';
    return curr;
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '12:00';
    }
  };

  const getItemDetails = (tx: TransactionResponse) => {
    const isIncoming = tx.receiver_account === userAccount || tx.tx_type === 'deposit';
    let icon = 'sync_alt';
    let color = 'blue';
    let name = `Transfer to ${tx.receiver_account}`;

    if (tx.tx_type === 'deposit' || (isIncoming && tx.sender_account.includes('SEPA'))) {
      icon = 'account_balance';
      color = 'green';
      name = 'SEPA Wire Deposit';
    } else if (tx.tx_type === 'withdrawal') {
      icon = 'north_east';
      color = 'orange';
      name = `Payout to ${tx.receiver_account.substring(0, 8)}...`;
    } else if (tx.tx_type === 'savings_deposit' || tx.tx_type === 'savings_withdraw') {
      icon = 'savings';
      color = 'purple';
      name = tx.description || 'Savings Vault Transfer';
    } else if (isIncoming) {
      icon = 'arrow_downward';
      color = 'green';
      name = `Transfer from ${tx.sender_account}`;
    } else {
      icon = 'arrow_upward';
      color = 'blue';
      name = `Transfer to ${tx.receiver_account}`;
    }

    return { isIncoming, icon, color, name };
  };

  return (
    <>
      {detailed && (
        <div className='history-header flex flex-v-center flex-space-between'>
          <span className='text-shadow no-select date'>{date || 'Recent Activity'}</span>
          <span className='text-shadow no-select amount flex flex-end'>{dateBalance}</span>
        </div>
      )}
      <div className='history'>
        {loading ? (
          <div style={{ padding: '10px 6px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className='history-line flex flex-v-center flex-space-between' style={{ opacity: 0.6 }}>
                <div className='circle-icon gray' style={{ width: '40px', height: '40px' }} />
                <div className='history-line-details' style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className='skeleton' style={{ width: '130px', height: '14px' }} />
                  <div className='skeleton' style={{ width: '70px', height: '10px' }} />
                </div>
                <div className='skeleton' style={{ width: '60px', height: '16px' }} />
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((tx) => {
            const { isIncoming, icon, color, name } = getItemDetails(tx);
            return (
              <HistoryLine
                key={tx.id}
                onClick={() => {
                  setSelectedTx({
                    ...tx,
                    is_incoming: isIncoming
                  });
                }}
                item={{
                  id: tx.id,
                  icon: icon,
                  time: formatTime(tx.timestamp),
                  name: tx.description || name,
                  amount: tx.amount,
                  color: color,
                  currencySymbol: getCurrencySymbol(tx.currency),
                  isIncoming: isIncoming
                }}
              />
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '1.75rem 1rem' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '2.5rem', opacity: 0.5, marginBottom: '0.5rem' }}>
              receipt_long
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>No transactions yet</p>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e0', marginTop: '0.25rem' }}>Your transfer activity will appear here.</p>
          </div>
        )}

        {!detailed && (
          <Link to='/transactions' className='history-line bottom flex flex-v-center flex-h-center'>
            See all
            <span className='material-symbols-outlined'>keyboard_arrow_right</span>
          </Link>
        )}
      </div>

      {/* Cash App Style Transaction Receipt Modal */}
      <ReceiptModal 
        transaction={selectedTx} 
        onClose={() => setSelectedTx(null)} 
      />
    </>
  );
};

export default History;
