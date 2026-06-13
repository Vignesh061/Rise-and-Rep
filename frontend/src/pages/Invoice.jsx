import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiPrinter, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function Invoice() {
    const { membershipId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosInstance.get(`/memberships/invoice/${membershipId}`)
            .then(res => setInvoice(res.data))
            .catch(err => setError(err.response?.data?.error || 'Failed to load invoice'))
            .finally(() => setLoading(false));
    }, [membershipId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gym-dark">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gym-dark p-6 text-center">
                <div className="text-red-500 mb-4 text-5xl">⚠</div>
                <h2 className="text-2xl font-bold text-white mb-2">Invoice Not Found</h2>
                <p className="text-slate-400 mb-6">{error}</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gym-dark text-slate-300 p-6 lg:p-10 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Print actions - hidden during print */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <FiArrowLeft /> Back
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all shadow-lg"
                    >
                        <FiPrinter /> Print / Save PDF
                    </button>
                </div>

                {/* Printable Invoice Container */}
                <div className="bg-white text-slate-800 rounded-xl p-8 sm:p-12 shadow-2xl print:shadow-none print:p-0 print:bg-transparent relative overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12 border-b border-gray-200 pb-8">
                        <div>
                            <h1 className="text-3xl font-black text-red-600 tracking-tighter mb-1">RISE & REP</h1>
                            <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Gym Management</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">INVOICE</h2>
                            <p className="text-sm text-gray-500 font-mono">#{invoice.invoice_number}</p>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid sm:grid-cols-2 gap-8 mb-12">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Billed To</p>
                            <p className="text-lg font-bold text-gray-800">{invoice.user_name}</p>
                            <p className="text-sm text-gray-500">{invoice.user_email}</p>
                        </div>
                        <div className="sm:text-right">
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Payment Date</p>
                                <p className="text-sm font-medium text-gray-800">{new Date(invoice.payment_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Membership ID</p>
                                <p className="text-xs font-mono text-gray-500">{invoice.membership_id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-12">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-800 text-gray-800 text-sm">
                                    <th className="py-3 font-bold">Package Details</th>
                                    <th className="py-3 font-bold text-center">Valid Period</th>
                                    <th className="py-3 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-5">
                                        <p className="font-bold text-gray-800 text-lg capitalize">{invoice.package_name} Plan</p>
                                        <p className="text-sm text-gray-500 mt-1">Gym access membership fee</p>
                                    </td>
                                    <td className="py-5 text-center text-sm text-gray-600">
                                        {new Date(invoice.start_date).toLocaleDateString()} <br/>
                                        <span className="text-gray-400 text-xs">to</span> <br/>
                                        {new Date(invoice.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="py-5 text-right font-bold text-gray-800 text-lg">
                                        ₹{invoice.amount}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-between items-start mb-16">
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                            <FiCheckCircle size={18} />
                            <span className="font-bold text-sm uppercase tracking-wide">
                                Payment {invoice.payment_status}
                            </span>
                        </div>
                        <div className="text-right w-64">
                            <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">₹{invoice.amount}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                                <span className="text-gray-500">Tax (0%)</span>
                                <span className="font-medium">₹0.00</span>
                            </div>
                            <div className="flex justify-between py-4 text-xl">
                                <span className="font-bold text-gray-800">Total</span>
                                <span className="font-black text-red-600">₹{invoice.amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
                        <p className="mb-1 font-medium text-gray-500">Thank you for choosing Rise & Rep Gym.</p>
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
