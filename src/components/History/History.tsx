import React, { useState, useEffect, useContext, useMemo } from 'react';
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
  limit?: number;
}

const History: React.FC<IProps> = ({
  date = undefined,
  detailed = false,
  dateBalance = undefined,
  limit = 4,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [userAccount, setUserAccount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received' | 'savings'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

        if (historyRes.data) {
          setTransactions(historyRes.data);
        }
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
    } else if (tx.tx_type === 'savings_interest') {
      icon = 'trending_up';
      color = 'green';
      name = tx.description || 'Daily Compounded Interest';
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const isIncoming = tx.receiver_account === userAccount || tx.tx_type === 'deposit';
      
      // Filter by Category
      if (filterType === 'sent' && isIncoming) return false;
      if (filterType === 'received' && !isIncoming) return false;
      if (filterType === 'savings' && !tx.tx_type?.startsWith('savings')) return false;

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const senderMatch = (tx.sender_account || '').toLowerCase().includes(q);
        const receiverMatch = (tx.receiver_account || '').toLowerCase().includes(q);
        const amountMatch = tx.amount.toString().includes(q);
        return descMatch || senderMatch || receiverMatch || amountMatch;
      }

      return true;
    });
  }, [transactions, userAccount, filterType, searchQuery]);

  const displayedTransactions = detailed 
    ? filteredTransactions 
    : transactions.slice(0, limit);

  return (
    <>
      {detailed ? (
        <div style={{ marginBottom: '1rem' }}>
          <div className='history-header flex flex-v-center flex-space-between' style={{ marginBottom: '0.75rem' }}>
            <span className='text-shadow no-select date'>{date || 'All Activity'}</span>
            <span className='text-shadow no-select amount flex flex-end'>{dateBalance}</span>
          </div>

          {/* Filter Pills & Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {(['all', 'sent', 'received', 'savings'] as const).map((t) => (
                <button
                  key={t}
                  type='button'
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: filterType === t ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                    background: filterType === t ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: filterType === t ? '#60a5fa' : '#94a3b8',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t === 'all' ? `All (${transactions.length})` : t}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <span className='material-symbols-outlined' style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: '#64748b' }}>
                search
              </span>
              <input
                type='text'
                placeholder='Search by account, reference or amount...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.84rem'
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-v-center flex-space-between' style={{ padding: '0 4px 10px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Recent Activity
            </h3>
            {transactions.length > 0 && (
              <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600 }}>
                {transactions.length} Total
              </span>
            )}
          </div>
          <Link 
            to='/transactions' 
            style={{ fontSize: '0.84rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600, textDecoration: 'none' }}
          >
            See all
            <span className='material-symbols-outlined' style={{ fontSize: '1.05rem' }}>chevron_right</span>
          </Link>
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
        ) : displayedTransactions.length > 0 ? (
          displayedTransactions.map((tx) => {
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
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem', color: '#94a3b8' }}>
                receipt_long
              </span>
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              {searchQuery || filterType !== 'all' ? 'No matching transactions' : 'No transactions yet'}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 1.25rem 0' }}>
              {searchQuery || filterType !== 'all' ? 'Try adjusting your search query or filter.' : 'Your transfer and deposit activity will appear here.'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Link to='/transactions' className='btn-brand-blue' style={{ padding: '8px 18px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
                <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>send</span>
                Make a Transfer
              </Link>
            )}
          </div>
        )}

        {!detailed && transactions.length > limit && (
          <Link to='/transactions' className='history-line bottom flex flex-v-center flex-h-center' style={{ padding: '12px', fontWeight: 600, fontSize: '0.88rem' }}>
            View All Transactions ({transactions.length})
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem', marginLeft: '4px' }}>arrow_forward</span>
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
