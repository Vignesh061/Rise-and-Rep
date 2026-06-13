import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from '../../components/AdminLayout';
import { FiUsers, FiAward, FiCreditCard, FiTrendingUp, FiCheckCircle, FiAlertTriangle, FiXCircle, FiDollarSign } from 'react-icons/fi';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ total_users: 0, total_trainers: 0, total_plans: 0 });
    const [memStats, setMemStats] = useState({
        total_members: 0, active_members: 0, expiring_soon: 0, expired_members: 0, revenue: 0, total_packages: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axiosInstance.get('/admin/dashboard-stats').catch(() => ({ data: { total_users: 0, total_trainers: 0, total_plans: 0 } })),
            axiosInstance.get('/memberships/admin/stats').catch(() => ({ data: { total_members: 0, active_members: 0, expiring_soon: 0, expired_members: 0, revenue: 0, total_packages: 0 } }))
        ]).then(([generalRes, memRes]) => {
            setStats(generalRes.data);
            setMemStats(memRes.data);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const membershipCards = [
        {
            icon: <FiCheckCircle size={24} />,
            label: 'Active Members',
            value: memStats.active_members,
            color: 'from-green-500 to-emerald-600',
            bgGlow: 'shadow-green-500/10',
        },
        {
            icon: <FiAlertTriangle size={24} />,
            label: 'Expiring Soon',
            value: memStats.expiring_soon,
            color: 'from-yellow-400 to-orange-500',
            bgGlow: 'shadow-yellow-500/10',
        },
        {
            icon: <FiXCircle size={24} />,
            label: 'Expired Members',
            value: memStats.expired_members,
            color: 'from-red-500 to-red-700',
            bgGlow: 'shadow-red-500/10',
        },
        {
            icon: <FiDollarSign size={24} />,
            label: 'Total Revenue',
            value: `₹${memStats.revenue}`,
            color: 'from-blue-500 to-indigo-600',
            bgGlow: 'shadow-blue-500/10',
        },
    ];

    const generalCards = [
        {
            icon: <FiUsers size={24} />,
            label: 'Total Users',
            value: stats.total_users,
            color: 'from-slate-600 to-slate-800',
        },
        {
            icon: <FiAward size={24} />,
            label: 'Total Trainers',
            value: stats.total_trainers,
            color: 'from-slate-600 to-slate-800',
        },
        {
            icon: <FiCreditCard size={24} />,
            label: 'Packages',
            value: memStats.total_packages,
            color: 'from-slate-600 to-slate-800',
        },
    ];

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Admin <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-slate-400 mt-1">Overview of your gym management system</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Membership Stats Cards */}
                    <h2 className="text-lg font-semibold text-white mb-4">Membership Overview</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {membershipCards.map((c, i) => (
                            <div key={i} className={`glass rounded-2xl p-6 card-hover shadow-xl ${c.bgGlow}`}>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-4`}>
                                    {c.icon}
                                </div>
                                <p className="text-3xl font-bold text-white mb-1">{c.value}</p>
                                <p className="text-sm text-slate-400">{c.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* General System Stats */}
                    <h2 className="text-lg font-semibold text-white mb-4">System Stats</h2>
                    <div className="grid sm:grid-cols-3 gap-6 mb-10">
                        {generalCards.map((c, i) => (
                            <div key={i} className={`glass rounded-2xl p-6 flex items-center gap-4`}>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white`}>
                                    {c.icon}
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{c.value}</p>
                                    <p className="text-sm text-slate-400">{c.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FiTrendingUp /> Quick Actions
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Manage Packages', to: '/admin/memberships', desc: 'Create or edit plans' },
                                { label: 'View All Members', to: '/admin/members', desc: 'Search and filter members' },
                                { label: 'Expiring Soon', to: '/admin/expiring-members', desc: 'Action required' },
                                { label: 'Generate Reports', to: '/admin/reports', desc: 'Export data to CSV' },
                            ].map(action => (
                                <a key={action.to} href={action.to}
                                    className="block p-4 rounded-xl bg-white/5 border border-gym-border hover:border-red-600/30 hover:bg-white/10 transition-all group">
                                    <p className="text-white font-semibold group-hover:text-red-400 transition-colors">{action.label}</p>
                                    <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
