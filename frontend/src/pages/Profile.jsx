import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import axiosInstance from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import { FiUser, FiMail, FiPhone, FiTarget, FiEdit2, FiSave, FiX } from 'react-icons/fi';

const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'Fitness', 'Strength Training'];

function getBmiCategory(bmi) {
    if (!bmi) return { label: 'N/A', color: 'text-slate-400' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
    return { label: 'Obese', color: 'text-red-400' };
}

export default function Profile() {
    const { user, setUser } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await axiosInstance.get('/auth/profile');
            setProfile(data);
            setForm(data);
        } catch {
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axiosInstance.put('/auth/profile', {
                name: form.name,
                age: form.age ? parseInt(form.age) : null,
                mobile: form.mobile,
                height: form.height ? parseFloat(form.height) : null,
                weight: form.weight ? parseFloat(form.weight) : null,
                target_weight: form.target_weight ? parseFloat(form.target_weight) : null,
                fitness_goal: form.fitness_goal,
            });
            setProfile(data.user);
            setForm(data.user);
            setEditing(false);
            // Update navbar user name
            setUser(prev => ({ ...prev, name: data.user.name }));
            localStorage.setItem('user', JSON.stringify({ ...user, name: data.user.name }));
            showToast('Profile updated!', 'success');
        } catch {
            showToast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm(profile);
        setEditing(false);
    };

    if (loading) {
        return (
            <div className="flex pt-16 min-h-screen">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-10 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </main>
            </div>
        );
    }

    const bmiInfo = getBmiCategory(profile?.bmi);

    return (
        <div className="flex pt-16 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Profile</h1>
                        <p className="text-slate-400 mt-1">Manage your personal information</p>
                    </div>
                    {!editing ? (
                        <button onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all">
                            <FiEdit2 size={16} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gym-border text-slate-300 text-sm font-medium hover:bg-white/5 transition-all">
                                <FiX size={16} /> Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50">
                                <FiSave size={16} /> {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Card */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gym-border">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                            <FiUser className="text-white" size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                            <p className="text-sm text-slate-400">{profile?.email}</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                            {editing ? (
                                <input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" />
                            ) : (
                                <p className="text-white font-medium">{profile?.name || '—'}</p>
                            )}
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                Email <FiMail size={11} />
                            </label>
                            <p className="text-white font-medium flex items-center gap-2">
                                {profile?.email}
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">Read Only</span>
                            </p>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Age</label>
                            {editing ? (
                                <input type="number" value={form.age || ''} onChange={e => setForm({ ...form, age: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm"
                                    min="10" max="100" />
                            ) : (
                                <p className="text-white font-medium">{profile?.age || '—'}</p>
                            )}
                        </div>

                        {/* Gender (read-only) */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Gender</label>
                            <p className="text-white font-medium">{profile?.gender || '—'}</p>
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                Mobile <FiPhone size={11} />
                            </label>
                            {editing ? (
                                <input type="tel" value={form.mobile || ''} onChange={e => setForm({ ...form, mobile: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" />
                            ) : (
                                <p className="text-white font-medium">{profile?.mobile || '—'}</p>
                            )}
                        </div>

                        {/* Fitness Goal */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                Fitness Goal <FiTarget size={11} />
                            </label>
                            {editing ? (
                                <select value={form.fitness_goal || ''} onChange={e => setForm({ ...form, fitness_goal: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm">
                                    <option value="">Select</option>
                                    {FITNESS_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            ) : (
                                <p className="text-white font-medium">{profile?.fitness_goal || '—'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body Metrics Card */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Body Metrics</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Height */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Height (cm)</label>
                            {editing ? (
                                <input type="number" value={form.height || ''} onChange={e => setForm({ ...form, height: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-gym-border text-white text-sm mt-1"
                                    step="0.1" />
                            ) : (
                                <p className="text-2xl font-bold text-white">{profile?.height || '—'}</p>
                            )}
                        </div>

                        {/* Weight */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Weight (kg)</label>
                            {editing ? (
                                <input type="number" value={form.weight || ''} onChange={e => setForm({ ...form, weight: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-gym-border text-white text-sm mt-1"
                                    step="0.1" />
                            ) : (
                                <p className="text-2xl font-bold text-white">{profile?.weight || '—'}</p>
                            )}
                        </div>

                        {/* Target Weight */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Target Weight (kg)</label>
                            {editing ? (
                                <input type="number" value={form.target_weight || ''} onChange={e => setForm({ ...form, target_weight: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-gym-border text-white text-sm mt-1"
                                    step="0.1" />
                            ) : (
                                <p className="text-2xl font-bold text-white">{profile?.target_weight || '—'}</p>
                            )}
                        </div>

                        {/* BMI (auto-calculated, read-only) */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">BMI</label>
                            <p className={`text-2xl font-bold ${bmiInfo.color}`}>
                                {profile?.bmi || '—'}
                            </p>
                            <p className={`text-xs mt-1 ${bmiInfo.color}`}>{bmiInfo.label}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
