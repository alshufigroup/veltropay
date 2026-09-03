import React, { useState } from 'react';

// interfaces
interface IProps {
  balance: number;
  currency: string;
  currencySymbol: string;
  accountNumber?: string;
  isLoading?: boolean;
}

const Balance: React.FC<IProps> = ({ balance, currency, currencySymbol, accountNumber, isLoading = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='balance flex flex-col flex-v-center flex-h-center'>
      <p className='currency text-shadow no-select flex flex-v-center flex-h-center'>
        Main - {currency}
        <span className='material-symbols-outlined'>keyboard_arrow_down</span>
      </p>
      <h1 className='text-shadow no-select flex flex-h-center flex-v-center'>
        {isLoading ? (
          <div className='skeleton skeleton-balance' />
        ) : (
          <>
            <span>{currencySymbol}</span>
            {typeof balance === 'number' ? balance.toFixed(2) : balance}
          </>
        )}
      </h1>

      {accountNumber && !isLoading && (
        <button
          type='button'
          onClick={handleCopyAccount}
          className='account-number-pill'
          title='Click to copy your internal account number'
        >
          <span className='material-symbols-outlined' style={{ fontSize: '0.95rem', color: '#60a5fa' }}>
            account_balance_wallet
          </span>
          <span>Acc: <strong>{accountNumber}</strong></span>
          <span className='material-symbols-outlined' style={{ fontSize: '0.9rem', color: copied ? '#34d399' : '#94a3b8' }}>
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied && <span style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 700, marginLeft: '2px' }}>Copied!</span>}
        </button>
      )}
    </div>
  );
};

export default Balance;
