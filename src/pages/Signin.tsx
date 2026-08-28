import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/Form/Input';
import Button from '../components/Form/Button';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

const Signin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      login(res.data.access_token);
      window.location.href = '/home';
    } catch (err: any) {
      const errMsg = err.response?.data?.detail;
      if (errMsg === 'Email not verified') {
        window.location.href = '/verify?email=' + encodeURIComponent(email);
      } else {
        setError(errMsg || 'Sign in failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-v-center flex-h-center h-full'>
      <div className='bg' />
      <div className='text'>
        <h1 className='text-shadow'>Hello! 👋</h1>
        <p className='text-shadow'>Please sign in to your Veltrobridge account.</p>

        <form method='post' className='form' noValidate onSubmit={handleSubmit}>
          <div className='form-line'>
            <div className='label-line'>
              <label htmlFor='email' className='text-shadow'>
                Email
              </label>
            </div>
            <input
              required
              name='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Please enter your email'
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#000' }}
            />
          </div>
          <div className='form-line'>
            <div className='label-line flex flex-h-center flex-space-between'>
              <label htmlFor='password' className='text-shadow'>
                Password
              </label>
            </div>
            <input
              required
              name='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Please enter your password'
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#000' }}
            />
          </div>
          {error && <p style={{ color: '#f42d53', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
          <div className='form-line'>
            <button 
              type='submit' 
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#a0aec0' : '#ff8057', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className='links'>
          <a href='https://signup.veltrobridge.xyz' className='text-shadow'>
            Click here
          </a>
          &nbsp;
          <span className='text-shadow'>if you don&apos;t have an account</span>
        </div>
      </div>
    </div>
  );
};

export default Signin;
