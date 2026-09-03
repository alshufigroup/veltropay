import React, { useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useContext(AuthContext);

  const getInitials = (name?: string) => {
    if (!name) return 'VP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className='flex flex-v-center flex-space-between'>
      <div className='header-profile'>
        <Link to='/profile' style={{ textDecoration: 'none' }} title='View Profile & Settings'>
          <div className='profile-photo'>
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || 'Profile'} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              getInitials(user?.full_name)
            )}
          </div>
        </Link>
      </div>
      <div className='header-center'>
        <div className='header-search flex flex-v-center'>
          <span
            tabIndex={0}
            role='button'
            onKeyDown={() => {}}
            onClick={() => {
              inputRef.current?.focus();
            }}
            className='material-symbols-outlined no-select'
          >
            search
          </span>
          <input ref={inputRef} type='text' name='search' id='search' placeholder='Search' />
        </div>
      </div>
      <div className='header-buttons flex flex-1 flex-v-center flex-end'>
        <Link to='/transactions' className='header-button flex flex-v-center flex-h-center' title='Transactions'>
          <span className='material-symbols-outlined'>equalizer</span>
        </Link>
        <Link to='/cards' className='header-button flex flex-v-center flex-h-center' title='Virtual Cards'>
          <span className='material-symbols-outlined'>credit_card</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
