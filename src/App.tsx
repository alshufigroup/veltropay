import React from 'react';
import Navigation from './navigation/Navigation';
import Marketing from './pages/Marketing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';

const App: React.FC = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Global path-based route for email verification
  if (pathname.startsWith('/verify')) {
    return <VerifyEmail />;
  }

  if (hostname.startsWith('login.')) {
    return <Login />;
  }
  
  if (hostname.startsWith('signup.')) {
    return <Signup />;
  }

  if (hostname.startsWith('account.')) {
    return <Navigation />;
  }

  // Default to marketing page if it's the root domain (veltrobridge.xyz)
  // or localhost for development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // In dev, you might want to force a specific view to test
    // return <Navigation />;
  }
  
  return <Marketing />;
};

export default App;
