import React from 'react';
import { Link } from 'react-router-dom';

const Widgets: React.FC = () => (
  <div>
    <div style={{ padding: '0 4px 10px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
        Financial Hub
      </h3>
      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Explore Services</span>
    </div>

    <div className='widgets flex flex-v-center flex-space-between'>
      <Link to='/cards' className='widget no-select flex flex-col flex-v-center flex-h-center' style={{ position: 'relative', padding: '14px 8px' }}>
        <span className='material-symbols-outlined' style={{ color: '#38bdf8' }}>credit_card</span>
        <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: '#ffffff', fontSize: '0.86rem' }}>Cards</p>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Virtual & Metal</span>
      </Link>

      <Link to='/savings' className='widget no-select flex flex-col flex-v-center flex-h-center' style={{ position: 'relative', padding: '14px 8px' }}>
        <span className='material-symbols-outlined' style={{ color: '#34d399' }}>savings</span>
        <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: '#ffffff', fontSize: '0.86rem' }}>Savings</p>
        <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>+2.29% AER</span>
      </Link>

      <Link to='/add' className='widget no-select flex flex-col flex-v-center flex-h-center' style={{ position: 'relative', padding: '14px 8px' }}>
        <span className='material-symbols-outlined' style={{ color: '#fbbf24' }}>account_balance</span>
        <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: '#ffffff', fontSize: '0.86rem' }}>SEPA Wire</p>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Direct IBAN</span>
      </Link>
    </div>
  </div>
);

export default Widgets;
