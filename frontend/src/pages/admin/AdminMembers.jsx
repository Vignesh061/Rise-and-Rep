import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from '../../components/AdminLayout';
import { FiUsers, FiSearch, FiFilter } from 'react-icons/fi';

export default function AdminMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMembers();
    }, [search, statusFilter]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            // Added simple debounce locally if needed, but since it's admin, fetch on change is fine for now
            const params = new URLSearchParams();
            if (search) params.append('q', search);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            
            const { data } = await axiosInstance.get(`/memberships/admin/members?${params.toString()}`);
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400';
            case 'expiring_soon': return 'bg-yellow-500/20 text-yellow-400';
            case 'expired': return 'bg-red-500/20 text-red-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FiUsers /> Member List
                    </h1>
                    <p className="text-slate-400 mt-1">Manage and view all gym members</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm focus:border-red-500 transition-colors"
                        />
                    </div>
                    
                    {/* Filter */}
                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-48 pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm focus:border-red-500 transition-colors appearance-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="expiring_soon">Expiring Soon</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="glass rounded-2xl p-6 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-gym-border">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Member Name</th>
                                <th className="px-6 py-4">Package</th>
                                <th className="px-6 py-4">Start Date</th>
                                <th className="px-6 py-4">End Date</th>
                                <th className="px-6 py-4">Days Left</th>
                                <th className="px-6 py-4">Membership Status</th>
                                <th className="px-6 py-4 rounded-tr-xl">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m) => (
                                <tr key={m._id} className="border-b border-gym-border/50 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-white">{m.user_name}</p>
                                        <p className="text-xs text-slate-500">{m.user_email}</p>
                                        <p className="text-[10px] text-slate-600 font-mono mt-1">ID: {m.user_id}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white capitalize">
                                        {m.package_name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(m.start_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(m.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${m.days_remaining <= 7 ? 'text-yellow-400' : m.days_remaining === 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {m.days_remaining}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${getStatusStyle(m.membership_status)}`}>
                                            {m.membership_status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${m.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {m.payment_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {members.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            No members found matching the criteria.
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
