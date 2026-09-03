import React from 'react';

// interfaces
interface IProps {
  name: string;
  type: string;
  value?: string;
  tabIndex?: number;
  required?: boolean;
  placeholder?: string;
  autoComplete?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<IProps> = ({
  name,
  type,
  value,
  tabIndex = 0,
  placeholder = '',
  required = false,
  autoComplete = false,
  onChange,
  className = 'form-control-input',
}) => (
  <input
    id={name}
    name={name}
    type={type}
    value={value}
    tabIndex={tabIndex}
    required={required}
    placeholder={placeholder}
    autoComplete={autoComplete ? 'on' : 'off'}
    onChange={onChange}
    className={className}
  />
);

export default Input;
