import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      const res = await api.post('/auth/resend-otp', { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      setMessage('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-8">
        <h2 className="text-3xl font-serif text-center mb-4">Verify Email</h2>
        <p className="text-center text-gray-400 mb-8">We've sent a code to <br/><span className="text-[#f5f5f5]">{email}</span></p>
        
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">{error}</div>}
        {message && <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-6">{message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-400 mb-2">Enter OTP</label>
            <input 
              type="text" 
              className="input-field tracking-widest text-center text-2xl" 
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full btn-primary">Verify Account</button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={handleResend} className="text-sm text-gray-400 hover:text-[#d4af37] transition-colors">
            Didn't receive the code? Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
