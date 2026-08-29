import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import HistoryLine from './HistoryLine';
import { api } from '../../api';
import { AuthContext } from '../../context/AuthContext';

interface TransactionResponse {
  id: number;
  sender_account: string;
  receiver_account: string;
  amount: number;
  currency: string;
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await api.get('/transactions/history');
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to fetch transaction history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
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
          transactions.map((tx) => (
            <HistoryLine
              key={tx.id}
              item={{
                id: tx.id,
                icon: 'sync_alt',
                time: formatTime(tx.timestamp),
                name: `Transfer to/from ${tx.receiver_account}`,
                amount: tx.amount,
                color: 'blue',
                currencySymbol: getCurrencySymbol(tx.currency),
              }}
            />
          ))
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
    </>
  );
};

export default History;
