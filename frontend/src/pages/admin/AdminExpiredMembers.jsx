import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from '../../components/AdminLayout';
import { FiXCircle } from 'react-icons/fi';

export default function AdminExpiredMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/memberships/admin/expired')
            .then(res => setMembers(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                        <FiXCircle size={24} />
                    </div>
                    Expired Memberships
                </h1>
                <p className="text-slate-400 mt-2">All members whose memberships have already expired</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="glass rounded-2xl p-6 border border-red-500/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-red-400/70 uppercase bg-red-500/5 border-b border-red-500/20">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-xl">Member Name</th>
                                    <th className="px-6 py-4">Package</th>
                                    <th className="px-6 py-4">Expired Date</th>
                                    <th className="px-6 py-4 rounded-tr-xl">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m) => (
                                    <tr key={m._id} className="border-b border-gym-border/50 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">{m.user_name}</p>
                                            <p className="text-xs text-slate-500">{m.user_email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white capitalize">
                                            {m.package_name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(m.end_date).toLocaleDateString()}
                                            <span className="block text-xs text-slate-500 mt-1">
                                                {m.days_remaining} days ago (approx)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider bg-red-500/20 text-red-400">
                                                {m.membership_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {members.length === 0 && (
                            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                                <FiXCircle size={48} className="text-slate-600 mb-4" />
                                <p>No expired memberships found.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
