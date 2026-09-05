import React from 'react';
import Navigation from './navigation/Navigation';
import Marketing from './pages/Marketing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import AdminGate from './pages/AdminGate';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname.toLowerCase();

  // Hidden Master Admin Routes
  if (pathname.startsWith('/portal-admin-gate') || pathname === '/admin-gate' || pathname === '/admin/gate') {
    return <AdminGate />;
  }

  if (pathname.startsWith('/portal-admin-master') || pathname === '/admin' || pathname.startsWith('/admin/dashboard')) {
    return <AdminDashboard />;
  }

  // Global route for email verification
  if (pathname.startsWith('/verify')) {
    return <VerifyEmail />;
  }

  // Check login route (subdomain or path)
  if (hostname.startsWith('login.') || pathname.startsWith('/login') || pathname.startsWith('/signin')) {
    return <Login />;
  }
  
  // Check signup route (subdomain or path)
  if (hostname.startsWith('signup.') || pathname.startsWith('/signup') || pathname.startsWith('/register')) {
    return <Signup />;
  }

  // Check banking app routes (subdomain or path)
  if (
    hostname.startsWith('account.') || 
    pathname.startsWith('/account') || 
    pathname.startsWith('/home') || 
    pathname.startsWith('/cards') || 
    pathname.startsWith('/savings') || 
    pathname.startsWith('/transactions') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/add')
  ) {
    return <Navigation />;
  }

  // Default to Marketing landing page for root domain
  return <Marketing />;
};

export default App;
