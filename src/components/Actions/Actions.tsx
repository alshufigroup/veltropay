import React from 'react';
import { Link } from 'react-router-dom';

const Actions: React.FC = () => (
  <div className='actions flex flex-v-center flex-h-center'>
    <div className='circle no-select flex flex-col flex-v-center flex-h-center'>
      <Link to='/transactions' className='flex flex-v-center flex-h-center' title='Transfer Money'>
        <span className='material-symbols-outlined'>send</span>
      </Link>
      <span className='text-shadow'>Transfer</span>
    </div>

    <div className='circle no-select flex flex-col flex-v-center flex-h-center'>
      <Link to='/add' className='flex flex-v-center flex-h-center' title='Deposit / Add Funds'>
        <span className='material-symbols-outlined'>add</span>
      </Link>
      <span className='text-shadow'>Add Money</span>
    </div>

    <div className='circle no-select flex flex-col flex-v-center flex-h-center'>
      <Link to='/cards' className='flex flex-v-center flex-h-center' title='Virtual Debit Cards'>
        <span className='material-symbols-outlined'>credit_card</span>
      </Link>
      <span className='text-shadow'>Cards</span>
    </div>

    <div className='circle no-select flex flex-col flex-v-center flex-h-center'>
      <Link to='/savings' className='flex flex-v-center flex-h-center' title='High-Yield Savings'>
        <span className='material-symbols-outlined'>savings</span>
      </Link>
      <span className='text-shadow'>Savings</span>
    </div>
  </div>
);

export default Actions;
