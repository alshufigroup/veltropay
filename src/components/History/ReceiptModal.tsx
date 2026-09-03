import React, { useState } from 'react';

export interface TransactionDetails {
  id: number;
  sender_account: string;
  receiver_account: string;
  amount: number;
  currency: string;
  tx_type?: string;
  description?: string;
  timestamp: string;
  status: string;
  is_incoming?: boolean;
}

interface IProps {
  transaction: TransactionDetails | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<IProps> = ({ transaction, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isIncoming = transaction.is_incoming ?? (
    transaction.tx_type === 'deposit' || 
    transaction.description?.toLowerCase().includes('received')
  );

  const txType = transaction.tx_type || 'transfer';
  const symbol = transaction.currency === 'EUR' ? '€' : transaction.currency === 'USD' ? '$' : '£';
  const txRef = `VP-TX-${String(transaction.id).padStart(6, '0')}`;

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return ts;
    }
  };

  const copyReceiptSummary = () => {
    const text = `VeltroPay Transaction Receipt\n` +
      `────────────────────────\n` +
      `Reference: ${txRef}\n` +
      `Type: ${txType.toUpperCase()}\n` +
      `Amount: ${isIncoming ? '+' : '-'}${symbol}${transaction.amount.toFixed(2)} ${transaction.currency}\n` +
      `Status: ${transaction.status.toUpperCase()}\n` +
      `Date: ${formatDate(transaction.timestamp)}\n` +
      `Sender: ${transaction.sender_account}\n` +
      `Recipient: ${transaction.receiver_account}\n` +
      `────────────────────────\n` +
      `Powered by VeltroPay`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHeaderIcon = () => {
    if (txType === 'deposit' || isIncoming) return 'arrow_downward';
    if (txType === 'withdrawal') return 'north_east';
    if (txType === 'savings_deposit' || txType === 'savings_withdraw') return 'savings';
    if (txType === 'exchange') return 'currency_exchange';
    return 'arrow_upward';
  };

  const getHeaderColor = () => {
    if (txType === 'deposit' || isIncoming) return '#10b981';
    if (txType === 'withdrawal') return '#f97316';
    if (txType === 'savings_deposit' || txType === 'savings_withdraw') return '#8b5cf6';
    if (txType === 'exchange') return '#0ea5e9';
    return '#3b82f6';
  };

  const getTitle = () => {
    if (transaction.description) return transaction.description;
    if (txType === 'deposit') return 'SEPA Direct Wire Deposit';
    if (txType === 'withdrawal') return `Bank Wire Out to ${transaction.receiver_account}`;
    if (isIncoming) return `Transfer from ${transaction.sender_account}`;
    return `Transfer to ${transaction.receiver_account}`;
  };

  const getNetwork = () => {
    if (txType === 'deposit' || txType === 'withdrawal') return 'SEPA Instant Network (Banking Circle)';
    if (txType === 'savings_deposit' || txType === 'savings_withdraw') return 'VeltroPay Yield Vault Engine';
    return 'VeltroPay Internal Settlement Core';
  };

  return (
    <div className='receipt-modal-backdrop' onClick={onClose}>
      <div className='receipt-modal' onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type='button' className='receipt-close-btn' onClick={onClose} aria-label='Close'>
          <span className='material-symbols-outlined'>close</span>
        </button>

        {/* Status Glow Icon */}
        <div 
          className='receipt-avatar'
          style={{
            background: `${getHeaderColor()}22`,
            borderColor: `${getHeaderColor()}55`,
            color: getHeaderColor(),
            boxShadow: `0 0 24px ${getHeaderColor()}33`
          }}
        >
          <span className='material-symbols-outlined' style={{ fontSize: '2.2rem' }}>
            {getHeaderIcon()}
          </span>
        </div>

        {/* Big Amount Readout */}
        <div className='receipt-amount-container'>
          <h2 
            className='receipt-amount'
            style={{ color: isIncoming ? '#10b981' : '#ffffff' }}
          >
            {isIncoming ? '+' : '-'}{symbol}{transaction.amount.toFixed(2)}
          </h2>
          <span className='receipt-currency-tag'>{transaction.currency}</span>
        </div>

        {/* Status Pill */}
        <div className='receipt-status-pill'>
          <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#10b981' }}>
            check_circle
          </span>
          <span>{transaction.status === 'completed' ? 'Completed & Settled' : transaction.status}</span>
        </div>

        <p className='receipt-title'>{getTitle()}</p>

        {/* Receipt Detail Table */}
        <div className='receipt-table'>
          <div className='receipt-row'>
            <span className='receipt-label'>Transaction Ref</span>
            <div className='receipt-value-group'>
              <span className='receipt-value' style={{ fontFamily: 'monospace', color: '#93c5fd' }}>
                {txRef}
              </span>
              <button 
                type='button' 
                onClick={() => {
                  navigator.clipboard.writeText(txRef);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className='receipt-copy-mini'
                title='Copy Reference'
              >
                <span className='material-symbols-outlined'>content_copy</span>
              </button>
            </div>
          </div>

          <div className='receipt-row'>
            <span className='receipt-label'>Date & Time</span>
            <span className='receipt-value'>{formatDate(transaction.timestamp)}</span>
          </div>

          <div className='receipt-row'>
            <span className='receipt-label'>From</span>
            <span className='receipt-value' style={{ wordBreak: 'break-all' }}>{transaction.sender_account}</span>
          </div>

          <div className='receipt-row'>
            <span className='receipt-label'>To</span>
            <span className='receipt-value' style={{ wordBreak: 'break-all' }}>{transaction.receiver_account}</span>
          </div>

          <div className='receipt-row'>
            <span className='receipt-label'>Payment Network</span>
            <span className='receipt-value'>{getNetwork()}</span>
          </div>

          <div className='receipt-row' style={{ borderBottom: 'none' }}>
            <span className='receipt-label'>Fee</span>
            <span className='receipt-value' style={{ color: '#10b981' }}>0.00 {transaction.currency} (Free)</span>
          </div>
        </div>

        {/* Actions */}
        <div className='receipt-actions'>
          <button 
            type='button' 
            className='btn-secondary-action flex-1'
            onClick={copyReceiptSummary}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>
              {copied ? 'check' : 'share'}
            </span>
            {copied ? 'Receipt Copied!' : 'Share Receipt'}
          </button>
          
          <button 
            type='button' 
            className='btn-primary-action flex-1'
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
