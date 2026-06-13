import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import axiosInstance from '../../api/axiosInstance';
import { FiUser, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';

export default function AdminLogin() {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await axiosInstance.post('/admin/login', form);
            login(data.user, data.token);
            showToast('Welcome, Admin!', 'success');
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 hero-gradient">
            <div className="w-full max-w-md">
                <div className="glass rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/20">
                            <FiShield className="text-white" size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-sm text-slate-400 mt-1">Sign in to manage Rise & Rep</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Username</label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white placeholder-slate-500 text-sm"
                                    placeholder="admin"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white placeholder-slate-500 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold hover:shadow-lg hover:shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Signing in…' : <><span>Sign In as Admin</span><FiArrowRight /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        <Link to="/login" className="text-slate-400 hover:text-red-400 transition-colors">
                            ← Back to User Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
