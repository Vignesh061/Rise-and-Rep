import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import axiosInstance from '../api/axiosInstance';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight, FiTarget } from 'react-icons/fi';

const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'Fitness', 'Strength Training'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function Register() {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', age: '', gender: '', mobile: '', email: '',
        password: '', confirm_password: '', fitness_goal: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!form.name || !form.email || !form.password) return 'Name, email and password are required';
        if (form.password.length < 6) return 'Password must be at least 6 characters';
        if (form.password !== form.confirm_password) return 'Passwords do not match';
        if (form.mobile && !/^\d{10}$/.test(form.mobile)) return 'Mobile number must be 10 digits';
        if (form.age && (isNaN(form.age) || form.age < 10 || form.age > 100)) return 'Age must be between 10 and 100';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...form,
                age: form.age ? parseInt(form.age) : null,
            };
            const { data } = await axiosInstance.post('/auth/register', payload);
            login(data.user, data.token);
            showToast('Account created successfully!', 'success');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white placeholder-slate-500 text-sm';

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
            <div className="w-full max-w-lg">
                <div className="glass rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-black text-white">R</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-sm text-slate-400 mt-1">Start your fitness journey today</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Full Name *</label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="text" name="name" value={form.name} onChange={handleChange}
                                    className={inputClass} placeholder="John Doe" required />
                            </div>
                        </div>

                        {/* Age & Gender Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Age</label>
                                <input type="number" name="age" value={form.age} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white placeholder-slate-500 text-sm"
                                    placeholder="25" min="10" max="100" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Gender</label>
                                <select name="gender" value={form.gender} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white text-sm">
                                    <option value="">Select</option>
                                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Mobile Number</label>
                            <div className="relative">
                                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="tel" name="mobile" value={form.mobile} onChange={handleChange}
                                    className={inputClass} placeholder="9876543210" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Email *</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="email" name="email" value={form.email} onChange={handleChange}
                                    className={inputClass} placeholder="you@example.com" required />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Password *</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="password" name="password" value={form.password} onChange={handleChange}
                                    className={inputClass} placeholder="••••••••" required minLength={6} />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Confirm Password *</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange}
                                    className={inputClass} placeholder="••••••••" required minLength={6} />
                            </div>
                        </div>

                        {/* Fitness Goal */}
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Fitness Goal</label>
                            <div className="relative">
                                <FiTarget className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <select name="fitness_goal" value={form.fitness_goal} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gym-border text-white text-sm">
                                    <option value="">Select goal</option>
                                    {FITNESS_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? 'Creating account…' : <><span>Create Account</span><FiArrowRight /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-red-500 hover:text-red-400 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
