import { Routes, Route } from 'react-router-dom';

// components
import Add from '../pages/Add';
import Home from '../pages/Home';
import Cards from '../pages/Cards';
import Signin from '../pages/Signin';
import Profile from '../pages/Profile';
import Savings from '../pages/Savings';
import Transactions from '../pages/Transactions';
import AdminGate from '../pages/AdminGate';
import AdminDashboard from '../pages/AdminDashboard';

const Navigation: React.FC = () => (
  <Routes>
    <Route path='/' element={<Signin />} />
    <Route path='/add' element={<Add />} />
    <Route path='/home' element={<Home />} />
    <Route path='/cards' element={<Cards />} />
    <Route path='/profile' element={<Profile />} />
    <Route path='/savings' element={<Savings />} />
    <Route path='/transactions' element={<Transactions />} />
    <Route path='/portal-admin-gate' element={<AdminGate />} />
    <Route path='/portal-admin-master' element={<AdminDashboard />} />
    <Route path='/admin' element={<AdminDashboard />} />
  </Routes>
);

export default Navigation;
