import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from '../../components/AdminLayout';
import { FiAlertTriangle } from 'react-icons/fi';

export default function AdminExpiringMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/memberships/admin/expiring')
            .then(res => setMembers(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                        <FiAlertTriangle size={24} />
                    </div>
                    Expiring Members
                </h1>
                <p className="text-slate-400 mt-2">Memberships expiring within the next 7 days</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="glass rounded-2xl p-6 border border-yellow-500/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-yellow-400/70 uppercase bg-yellow-500/5 border-b border-yellow-500/20">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-xl">Member Name</th>
                                    <th className="px-6 py-4">Package</th>
                                    <th className="px-6 py-4">End Date</th>
                                    <th className="px-6 py-4 rounded-tr-xl">Days Remaining</th>
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
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-black text-lg ${m.days_remaining <= 3 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                                                {m.days_remaining}
                                            </span>
                                            <span className="text-xs text-slate-500 ml-1">days</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {members.length === 0 && (
                            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                                <FiAlertTriangle size={48} className="text-slate-600 mb-4" />
                                <p>Great! No memberships are expiring in the next 7 days.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
