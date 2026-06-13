import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from '../../components/AdminLayout';
import { FiPieChart, FiDownload } from 'react-icons/fi';

const TABS = [
    { id: 'active', label: 'Active Members' },
    { id: 'expiring', label: 'Expiring Members' },
    { id: 'expired', label: 'Expired Members' },
    { id: 'revenue', label: 'Revenue Report' },
];

export default function AdminReports() {
    const [activeTab, setActiveTab] = useState('active');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData(activeTab);
    }, [activeTab]);

    const fetchReportData = async (type) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/memberships/admin/reports?type=${type}`);
            setData(res.data);
        } catch (error) {
            console.error("Failed to load report", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCsv = async () => {
        try {
            const response = await axiosInstance.get(`/memberships/admin/reports/csv?type=${activeTab}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to download CSV", error);
        }
    };

    const renderTable = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            );
        }

        if (data.length === 0) {
            return <div className="text-center py-12 text-slate-500">No data available for this report.</div>;
        }

        if (activeTab === 'revenue') {
            const totalRev = data.reduce((sum, item) => sum + item.amount, 0);
            return (
                <div>
                    <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex justify-between items-center">
                        <span className="text-green-400 font-bold uppercase tracking-wider text-sm">Total Revenue (Paid)</span>
                        <span className="text-2xl font-black text-white">₹{totalRev}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-gym-border">
                                <tr>
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">User Name</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item._id} className="border-b border-gym-border/50 hover:bg-white/5">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{item._id}</td>
                                        <td className="px-6 py-4 text-white font-medium">{item.user_name}</td>
                                        <td className="px-6 py-4 text-green-400 font-bold">₹{item.amount}</td>
                                        <td className="px-6 py-4 text-slate-400 capitalize">{item.payment_method.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(item.payment_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // Default table for active, expiring, expired
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-gym-border">
                        <tr>
                            <th className="px-6 py-4">Member Name</th>
                            <th className="px-6 py-4">Package</th>
                            <th className="px-6 py-4">End Date</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((m) => (
                            <tr key={m._id} className="border-b border-gym-border/50 hover:bg-white/5">
                                <td className="px-6 py-4 text-white font-medium">{m.user_name}</td>
                                <td className="px-6 py-4 text-slate-300 capitalize">{m.package_name}</td>
                                <td className="px-6 py-4 text-slate-400">{new Date(m.end_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider bg-white/10 text-slate-300">
                                        {m.membership_status.replace('_', ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FiPieChart /> Membership Reports
                    </h1>
                    <p className="text-slate-400 mt-1">View and export detailed gym statistics</p>
                </div>
                <button
                    onClick={handleExportCsv}
                    disabled={loading || data.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
                >
                    <FiDownload /> Export CSV
                </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gym-border overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                                activeTab === tab.id
                                    ? 'text-white border-b-2 border-red-600 bg-white/5'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {renderTable()}
                </div>
            </div>
        </AdminLayout>
    );
}
