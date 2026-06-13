import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiShield, FiStar } from 'react-icons/fi';
import useToast from '../hooks/useToast';

export default function Membership() {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [currentMembership, setCurrentMembership] = useState(null);
    const [loading, setLoading] = useState(true);

    // Purchase Modal State
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pkgRes, memRes] = await Promise.all([
                axiosInstance.get('/memberships/packages'),
                axiosInstance.get('/memberships/my-membership')
            ]);
            setPackages(pkgRes.data);
            if (memRes.data && memRes.data.membership_status) {
                setCurrentMembership(memRes.data);
            }
        } catch (error) {
            console.error("Failed to load membership data", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            const endpoint = (currentMembership && currentMembership.membership_status !== 'expired')
                ? '/memberships/renew'
                : '/memberships/purchase';

            await axiosInstance.post(endpoint, { package_id: selectedPackage._id });
            showToast('Membership transaction successful!', 'success');
            navigate('/membership-dashboard');
        } catch (error) {
            showToast(error.response?.data?.error || 'Transaction failed. Please try again.', 'error');
        } finally {
            setIsPurchasing(false);
            setSelectedPackage(null);
        }
    };

    const getCalculatedEndDate = (durationMonths) => {
        const start = (currentMembership && currentMembership.membership_status === 'active')
            ? new Date(currentMembership.end_date)
            : new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + durationMonths);
        return end.toLocaleDateString();
    };

    const isActive = currentMembership && currentMembership.membership_status === 'active';

    return (
        <div className="flex pt-16 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Membership Packages</h1>
                    <p className="text-slate-400 mt-1">Choose the right plan for your fitness goals</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Current Membership Warning/Banner */}
                        {isActive && (
                            <div className="glass rounded-2xl p-6 mb-8 border border-green-500/30">
                                <div className="flex items-center gap-3">
                                    <FiShield className="text-green-400" size={24} />
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">You have an active membership</h2>
                                        <p className="text-sm text-slate-400">
                                            Purchasing a package now will <span className="text-white font-medium">renew/extend</span> your current end date ({new Date(currentMembership.end_date).toLocaleDateString()}).
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/membership-dashboard')}
                                        className="ml-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                                    >
                                        View Dashboard
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Packages Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {packages.map((pkg) => {
                                const isPopular = pkg.name.toLowerCase() === 'standard';
                                const isCurrent = currentMembership?.package_id === pkg._id;

                                return (
                                    <div key={pkg._id} className={`glass rounded-2xl p-6 relative flex flex-col ${isPopular ? 'border-red-600/50 shadow-[0_0_20px_rgba(229,9,20,0.15)] transform md:-translate-y-2' : ''}`}>
                                        {isPopular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-red-900/50">
                                                <FiStar size={12} /> Most Popular
                                            </div>
                                        )}
                                        {isCurrent && isActive && (
                                            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                                Current
                                            </div>
                                        )}

                                        <h3 className="text-xl font-bold text-white capitalize mb-1">{pkg.name}</h3>
                                        <p className="text-3xl font-black gradient-text mb-1">₹{pkg.price}</p>
                                        <p className="text-xs text-slate-500 mb-4">{pkg.duration_months} month{pkg.duration_months > 1 ? 's' : ''}</p>

                                        <p className="text-sm text-slate-300 mb-6 flex-1">{pkg.description}</p>

                                        <button
                                            onClick={() => setSelectedPackage(pkg)}
                                            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all mt-auto ${isPopular
                                                ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25'
                                                : 'border border-slate-600 text-slate-300 hover:bg-white/5 hover:border-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {isActive ? 'Renew with this' : 'Purchase Package'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        {packages.length === 0 && (
                            <div className="text-center py-20 text-slate-500 glass rounded-2xl">
                                No active membership packages available at the moment.
                            </div>
                        )}
                    </>
                )}

                {/* Purchase Confirmation Modal */}
                <Modal isOpen={!!selectedPackage} onClose={() => !isPurchasing && setSelectedPackage(null)} title="Confirm Transaction">
                    {selectedPackage && (
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-xl p-4 border border-gym-border">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400">Package</span>
                                    <span className="text-white font-bold text-lg">{selectedPackage.name}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400">Duration</span>
                                    <span className="text-white">{selectedPackage.duration_months} Month(s)</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gym-border/50">
                                    <span className="text-slate-400">Total Price</span>
                                    <span className="text-red-500 font-black text-xl">₹{selectedPackage.price}</span>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                                <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                                    <FiClock /> Membership Validity
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 mb-1">Start Date</p>
                                        <p className="text-white font-medium">
                                            {(isActive)
                                                ? new Date(currentMembership.end_date).toLocaleDateString()
                                                : new Date().toLocaleDateString()
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">End Date</p>
                                        <p className="text-white font-medium">
                                            {getCalculatedEndDate(selectedPackage.duration_months)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-gym-border text-center">
                                <p className="text-xs text-slate-400 mb-2">Phase 2: Payment Simulation</p>
                                <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
                                    <FiCheckCircle /> Simulated Card Payment
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setSelectedPackage(null)}
                                    disabled={isPurchasing}
                                    className="flex-1 py-3 rounded-xl border border-gym-border text-slate-300 text-sm font-medium hover:bg-white/5 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePurchase}
                                    disabled={isPurchasing}
                                    className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPurchasing ? 'Processing...' : `Pay ₹${selectedPackage.price}`}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

            </main>
        </div>
    );
}
