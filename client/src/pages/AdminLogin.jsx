import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/admin/login', { email, password });
            login(res.data.token, res.data.user);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#0a0a0a] px-4">
            <div className="max-w-md w-full bg-[#111] p-8 rounded-xl border border-[#333] shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-[#d4af37] mb-2">Admin Portal</h1>
                    <p className="text-gray-400 text-sm">Sign in to manage the gallery</p>
                </div>
                
                {error && (
                    <div className="bg-red-900/30 border border-red-900 text-red-400 px-4 py-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            className="input-field w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Password</label>
                        <input 
                            type="password" 
                            required 
                            className="input-field w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-primary py-3"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;