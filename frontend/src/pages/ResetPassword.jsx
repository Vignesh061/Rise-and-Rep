import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import useToast from '../hooks/useToast';
import { FiLock, FiArrowLeft } from 'react-icons/fi';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [form, setForm] = useState({ new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.new_password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (form.new_password !== form.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/auth/reset-password', {
                token,
                new_password: form.new_password,
                confirm_password: form.confirm_password,
            });
            showToast('Password reset successfully!', 'success');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
            <div className="w-full max-w-md">
                <div className="glass rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-4">
                            <FiLock className="text-white" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                        <p className="text-sm text-slate-400 mt-1">Enter your new password below</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">New Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="password"
                                    value={form.new_password}
                                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white placeholder-slate-500 text-sm"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Confirm Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="password"
                                    value={form.confirm_password}
                                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white placeholder-slate-500 text-sm"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Resetting…' : 'Reset Password'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        <Link to="/login" className="text-red-500 hover:text-red-400 font-medium flex items-center justify-center gap-1">
                            <FiArrowLeft size={14} /> Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
