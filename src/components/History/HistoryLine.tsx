import React from 'react';
import Circle from '../Circle/Circle';

export interface IData {
  id: number;
  icon: string;
  name: string;
  time: string;
  color: string;
  amount: number;
  currencySymbol: string;
  isIncoming?: boolean;
}

interface IProps {
  item: IData;
  onClick?: () => void;
}

const HistoryLine: React.FC<IProps> = ({ item, onClick }) => {
  const isIncoming = item.isIncoming;

  return (
    <div 
      className='history-line flex flex-h-center flex-v-center'
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'background 0.2s ease, transform 0.15s ease' }}
      title='Click to view transaction receipt'
    >
      <div className='history-line-icon flex flex-1'>
        <Circle color={item.color} icon={item.icon} />
      </div>
      <div className='history-line-details flex flex-col'>
        <span className='name'>{item.name}</span>
        <span className='time'>{item.time}</span>
      </div>
      <div className='history-line-amount flex flex-1 flex-end'>
        <p style={{ color: isIncoming ? '#10b981' : '#ffffff', fontWeight: 600 }}>
          {isIncoming ? '+' : '-'} {item.currencySymbol}
          {item.amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default HistoryLine;
