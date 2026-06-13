import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const { data } = await axiosInstance.post('/auth/forgot-password', { email });
            setMessage(data.message || 'If this email exists, a reset link has been sent.');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
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
                            <FiMail className="text-white" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
                        <p className="text-sm text-slate-400 mt-1">Enter your email and we'll send you a reset link</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white placeholder-slate-500 text-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Sending…' : 'Send Reset Link'}
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
