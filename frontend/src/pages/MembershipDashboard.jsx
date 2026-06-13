import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiXCircle, FiCreditCard, FiRefreshCw, FiFileText } from 'react-icons/fi';

export default function MembershipDashboard() {
    const navigate = useNavigate();
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembership();
    }, []);

    const fetchMembership = async () => {
        try {
            const res = await axiosInstance.get('/memberships/my-membership');
            if (res.data && res.data.membership_status) {
                setMembership(res.data);
            } else {
                setMembership(null);
            }
        } catch (error) {
            console.error("Failed to fetch membership", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'active':
                return {
                    color: 'text-green-400',
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    icon: <FiCheckCircle size={20} />,
                    label: 'Active'
                };
            case 'expiring_soon':
                return {
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/30',
                    icon: <FiAlertTriangle size={20} />,
                    label: 'Expiring Soon'
                };
            case 'expired':
                return {
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    icon: <FiXCircle size={20} />,
                    label: 'Expired'
                };
            default:
                return {
                    color: 'text-slate-400',
                    bg: 'bg-white/10',
                    border: 'border-gym-border',
                    icon: <FiClock size={20} />,
                    label: 'Unknown'
                };
        }
    };

    return (
        <div className="flex pt-16 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10 max-w-6xl">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Membership Dashboard</h1>
                        <p className="text-slate-400 mt-1">Manage your current subscription and view details</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/membership-history" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-gym-border text-sm font-medium text-slate-300 hover:bg-white/10 transition-all">
                            <FiClock /> History
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : !membership ? (
                    <div className="glass rounded-2xl p-10 text-center border-dashed border-2 border-slate-700">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <FiCreditCard size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No Active Membership</h2>
                        <p className="text-slate-400 mb-6 max-w-md mx-auto">
                            You don't have an active gym membership. Purchase a package to unlock full access to our facilities.
                        </p>
                        <button
                            onClick={() => navigate('/membership')}
                            className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                        >
                            View Packages
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Status Banner */}
                        <div className={`glass rounded-2xl p-6 border ${getStatusConfig(membership.membership_status).border} ${getStatusConfig(membership.membership_status).bg}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-white/10 ${getStatusConfig(membership.membership_status).color}`}>
                                        {getStatusConfig(membership.membership_status).icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <h2 className={`text-2xl font-bold ${getStatusConfig(membership.membership_status).color}`}>
                                            {getStatusConfig(membership.membership_status).label}
                                        </h2>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Days Remaining</p>
                                    <p className="text-3xl font-black text-white">{membership.days_remaining}</p>
                                </div>
                            </div>
                            
                            {/* Progress Bar (if active/expiring) */}
                            {membership.membership_status !== 'expired' && (
                                <div className="mt-6">
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${membership.membership_status === 'expiring_soon' ? 'bg-yellow-400' : 'bg-green-400'}`}
                                            style={{ 
                                                width: `${Math.min(100, Math.max(5, (membership.days_remaining / 365) * 100))}%` 
                                                // Approximating progress visually, or could calculate exactly if total duration was known
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-slate-400">
                                        <span>Start: {new Date(membership.start_date).toLocaleDateString()}</span>
                                        <span>End: {new Date(membership.end_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gym-border pb-2">Plan Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Package Name</p>
                                        <p className="text-lg font-medium text-white capitalize">{membership.package_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Membership ID</p>
                                        <p className="text-sm font-mono text-slate-300">{membership._id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gym-border pb-2">Payment Info</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Payment Status</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                                            ${membership.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {membership.payment_status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Last Purchased/Renewed</p>
                                        <p className="text-sm text-white">{new Date(membership.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="pt-2">
                                        <button 
                                            onClick={() => navigate(`/invoice/${membership._id}`)}
                                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            <FiFileText /> View Latest Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => navigate('/membership')}
                                className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                            >
                                <FiRefreshCw /> {membership.membership_status === 'expired' ? 'Purchase New Plan' : 'Renew Membership'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
