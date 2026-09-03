import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void> | void;
  title?: string;
  subtitle?: string;
  amountDisplay?: string;
  recipientDisplay?: string;
  isLoading?: boolean;
  errorMessage?: string;
}

export const TransactionPinModal: React.FC<TransactionPinModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Security Verification',
  subtitle = 'Enter your 6-digit Transaction PIN to authorize this transfer.',
  amountDisplay,
  recipientDisplay,
  isLoading = false,
  errorMessage = ''
}) => {
  const [pin, setPin] = useState<string>('');
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [tempPin, setTempPin] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');
  const [isCheckingPin, setIsCheckingPin] = useState<boolean>(true);
  const [isSettingPin, setIsSettingPin] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  // Check if user has a PIN configured
  const checkUserPinStatus = useCallback(async () => {
    try {
      setIsCheckingPin(true);
      const res = await api.get('/auth/pin/status');
      setHasPin(res.data.has_pin);
    } catch (err) {
      setHasPin(true); // default to enter PIN mode if check fails
    } finally {
      setIsCheckingPin(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setTempPin('');
      setLocalError('');
      setSetupStep('create');
      checkUserPinStatus();
    }
  }, [isOpen, checkUserPinStatus]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleDigitPress = (digit: string) => {
    if (isLoading || isSettingPin) return;
    setLocalError('');

    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);

      if (nextPin.length === 6) {
        handleCompletePin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isLoading || isSettingPin) return;
    setLocalError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isLoading || isSettingPin) return;
    setLocalError('');
    setPin('');
  };

  const handleCompletePin = async (completedPin: string) => {
    if (hasPin === false) {
      // Setup Mode
      if (setupStep === 'create') {
        setTempPin(completedPin);
        setPin('');
        setSetupStep('confirm');
      } else if (setupStep === 'confirm') {
        if (completedPin !== tempPin) {
          setLocalError('PINs do not match. Please try again.');
          triggerShake();
          setPin('');
          setTempPin('');
          setSetupStep('create');
          return;
        }

        try {
          setIsSettingPin(true);
          await api.post('/auth/pin/set', { pin: completedPin });
          setHasPin(true);
          // Immediately proceed with transaction
          await onConfirm(completedPin);
        } catch (err: any) {
          setLocalError(err.response?.data?.detail || 'Failed to set Transaction PIN');
          triggerShake();
        } finally {
          setIsSettingPin(false);
        }
      }
    } else {
      // Normal Execution Mode
      try {
        await onConfirm(completedPin);
      } catch (err) {
        triggerShake();
      }
    }
  };

  // Keyboard handler for tactile entry
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, hasPin, setupStep, tempPin, isLoading, isSettingPin]);

  if (!isOpen) return null;

  const displayError = errorMessage || localError;

  return (
    <div className='pin-modal-backdrop' onClick={onClose}>
      <div 
        className={`pin-modal-card ${shake ? 'pin-shake' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='pin-modal-header'>
          <div className='pin-shield-icon'>
            <span className='material-symbols-outlined'>shield_lock</span>
          </div>
          <h2 className='pin-modal-title'>
            {hasPin === false 
              ? (setupStep === 'create' ? 'Create Transaction PIN' : 'Confirm Your PIN')
              : title}
          </h2>
          <p className='pin-modal-subtitle'>
            {hasPin === false 
              ? (setupStep === 'create' ? 'Set a secure 6-digit PIN to authorize all future transfers & withdrawals.' : 'Re-enter your 6-digit PIN to confirm.')
              : subtitle}
          </p>
        </div>

        {/* Transaction Summary Chip (if provided) */}
        {amountDisplay && hasPin !== false && (
          <div className='pin-summary-pill'>
            <div className='pin-summary-row'>
              <span className='pin-summary-label'>Authorization Amount:</span>
              <span className='pin-summary-amount'>{amountDisplay}</span>
            </div>
            {recipientDisplay && (
              <div className='pin-summary-row' style={{ marginTop: '4px' }}>
                <span className='pin-summary-label'>Recipient:</span>
                <span className='pin-summary-recipient'>{recipientDisplay}</span>
              </div>
            )}
          </div>
        )}

        {/* 6-Dot PIN Display */}
        <div className='pin-dots-container'>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            const isCurrent = index === pin.length && !isFilled;
            return (
              <div 
                key={index} 
                className={`pin-dot ${isFilled ? 'filled' : ''} ${isCurrent ? 'active' : ''}`}
              />
            );
          })}
        </div>

        {/* Error / Status Message */}
        {displayError ? (
          <div className='pin-error-text'>
            <span className='material-symbols-outlined' style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>error</span>
            {displayError}
          </div>
        ) : (
          <div className='pin-hint-text'>
            {isCheckingPin ? 'Checking security status...' : '256-Bit Encrypted Security'}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className='pin-keypad-grid'>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type='button'
              className='pin-key-btn'
              onClick={() => handleDigitPress(digit)}
              disabled={isLoading || isSettingPin}
            >
              {digit}
            </button>
          ))}
          <button
            type='button'
            className='pin-key-btn pin-key-action'
            onClick={handleClear}
            disabled={isLoading || isSettingPin || pin.length === 0}
          >
            Clear
          </button>
          <button
            type='button'
            className='pin-key-btn'
            onClick={() => handleDigitPress('0')}
            disabled={isLoading || isSettingPin}
          >
            0
          </button>
          <button
            type='button'
            className='pin-key-btn pin-key-action'
            onClick={handleBackspace}
            disabled={isLoading || isSettingPin || pin.length === 0}
          >
            <span className='material-symbols-outlined' style={{ fontSize: '1.4rem' }}>backspace</span>
          </button>
        </div>

        {/* Loading Indicator / Cancel */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          {isLoading || isSettingPin ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#60a5fa', fontSize: '0.9rem', fontWeight: 600 }}>
              <span className='material-symbols-outlined' style={{ animation: 'spin 1s linear infinite' }}>sync</span>
              Authorizing securely...
            </div>
          ) : (
            <button
              type='button'
              className='btn-pin-cancel'
              onClick={onClose}
            >
              Cancel Transfer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionPinModal;
