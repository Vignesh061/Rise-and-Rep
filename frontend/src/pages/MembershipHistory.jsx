import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import { FiClock, FiFileText, FiArrowLeft } from 'react-icons/fi';

export default function MembershipHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/memberships/history')
            .then(res => setHistory(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex pt-16 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10 max-w-6xl">
                <div className="mb-8">
                    <button 
                        onClick={() => navigate('/membership-dashboard')}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <FiArrowLeft /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FiClock /> Membership History
                    </h1>
                    <p className="text-slate-400 mt-1">View your past memberships and renewals</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="glass rounded-2xl p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-gym-border">
                                    <tr>
                                        <th className="px-6 py-4 rounded-tl-xl">Package</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Amount Paid</th>
                                        <th className="px-6 py-4">Valid Period</th>
                                        <th className="px-6 py-4">Transaction Date</th>
                                        <th className="px-6 py-4 rounded-tr-xl text-right">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item, i) => (
                                        <tr key={item._id} className="border-b border-gym-border/50 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white capitalize">
                                                {item.package_name}
                                                <span className="block text-[10px] text-slate-500 font-mono mt-1">{item.membership_id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider
                                                    ${item.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                                                      item.status === 'renewed' ? 'bg-blue-500/20 text-blue-400' : 
                                                      'bg-slate-500/20 text-slate-400'}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                ₹{item.amount_paid}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                <div className="whitespace-nowrap">{new Date(item.start_date).toLocaleDateString()}</div>
                                                <div className="whitespace-nowrap">to {new Date(item.end_date).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(item.payment_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/invoice/${item.membership_id}`)}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all inline-flex items-center gap-2"
                                                    title="View Invoice"
                                                >
                                                    <FiFileText size={16} /> <span className="sr-only sm:not-sr-only text-xs">View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {history.length === 0 && (
                                <div className="text-center py-10 text-slate-500">
                                    No membership history found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
