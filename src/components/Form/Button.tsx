import React from 'react';

// interfaces
interface IProps {
  type?: string;
  text: string;
  tabIndex?: number;
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<IProps> = ({ 
  type = 'button', 
  text, 
  tabIndex = 0, 
  disabled = false,
  onClick
}) => (
  <button
    tabIndex={tabIndex}
    type={type === 'submit' ? 'submit' : 'button'}
    disabled={disabled}
    onClick={onClick}
    className={`button ${disabled ? 'disabled' : 'active'}`}
  >
    {text}
  </button>
);

export default Button;
