import React from 'react';

// interfaces
interface IProps {
  number: string;
  cvcNumber: string;
  validUntil: string;
  cardHolder: string;
  balance?: number;
  currencySymbol?: string;
  limit?: number;
}

const Card: React.FC<IProps> = ({ 
  number, 
  cvcNumber, 
  validUntil, 
  cardHolder, 
  balance = 0, 
  currencySymbol = '€', 
  limit = 2500 
}) => (
  <>
    <div className='card no-select'>
      <div className='card-inner'>
        <div className='front'>
          <div className='row'>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px' }}>VeltroPay</span>
              <span className='material-symbols-outlined' style={{ fontSize: '1.2rem', color: '#93c5fd' }}>contactless</span>
            </div>
            <svg fill='#ffffff' width='60px' height='36px' viewBox='0 0 24.00 24.00'>
              <g stroke='#cccccc' strokeWidth='0.048' />
              <g>
                <path d='M16.539 9.186a4.155 4.155 0 0 0-1.451-.251c-1.6 0-2.73.806-2.738 1.963-.01.85.803 1.329 1.418 1.613.631.292.842.476.84.737-.004.397-.504.577-.969.577-.639 0-.988-.089-1.525-.312l-.199-.093-.227 1.332c.389.162 1.09.301 1.814.313 1.701 0 2.813-.801 2.826-2.032.014-.679-.426-1.192-1.352-1.616-.563-.275-.912-.459-.912-.738 0-.247.299-.511.924-.511a2.95 2.95 0 0 1 1.213.229l.15.067.227-1.287-.039.009zm4.152-.143h-1.25c-.389 0-.682.107-.852.493l-2.404 5.446h1.701l.34-.893 2.076.002c.049.209.199.891.199.891h1.5l-1.31-5.939zm-10.642-.05h1.621l-1.014 5.942H9.037l1.012-5.944v.002zm-4.115 3.275.168.825 1.584-4.05h1.717l-2.551 5.931H5.139l-1.4-5.022a.339.339 0 0 0-.149-.199 6.948 6.948 0 0 0-1.592-.589l.022-.125h2.609c.354.014.639.125.734.503l.57 2.729v-.003zm12.757.606.646-1.662c-.008.018.133-.343.215-.566l.111.513.375 1.714H18.69v.001h.001z' />
              </g>
            </svg>
          </div>
          <div className='row card-no'>
            <p>{number}</p>
          </div>
          <div className='row card-holder'>
            <p>CARD HOLDER</p>
            <p>VALID UNTIL</p>
          </div>
          <div className='row name'>
            <p>{cardHolder}</p>
            <p>{validUntil}</p>
          </div>
        </div>
        <div className='back'>
          <div className='bar' />
          <div className='row card-cvv'>
            <div className='signature-back' />
            <p>{cvcNumber}</p>
          </div>
          <div className='row card-text'>
            <p>
              This card is property of VeltroPay. If found, please return to VeltroPay or contact customer support immediately.
            </p>
          </div>
          <div className='row signature'>
            <p>AUTHORIZED SIGNATURE</p>
          </div>
        </div>
      </div>
    </div>

    <div className='card-balance flex flex-v-center flex-space-between'>
      <div className='flex flex-col flex-h-center flex-1 center'>
        <h3>Available Card Balance</h3>
        <span>{currencySymbol} {balance.toFixed(2)}</span>
      </div>
      <div className='flex flex-col flex-h-center flex-1 center' style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h3>Daily Limit</h3>
        <span>{currencySymbol} {limit.toFixed(2)}</span>
      </div>
    </div>
  </>
);

export default Card;
