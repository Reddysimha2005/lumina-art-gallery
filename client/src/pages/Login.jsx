import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-8">
        <h2 className="text-3xl font-serif text-center mb-8">Welcome Back</h2>
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-400 mb-2">Email</label>
            <input 
              type="email" 
              className="input-field" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              className="input-field" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full btn-primary">Sign In</button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          New to Lumina? <Link to="/register" className="text-[#d4af37] hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
