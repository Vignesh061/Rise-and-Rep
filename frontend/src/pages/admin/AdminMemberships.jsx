import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useToast from '../../hooks/useToast';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiCreditCard, FiPower } from 'react-icons/fi';

const EMPTY_FORM = { name: '', duration_months: '', price: '', description: '', status: 'active' };

export default function AdminMemberships() {
    const { showToast } = useToast();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showAdd, setShowAdd] = useState(false);
    const [viewPkg, setViewPkg] = useState(null);
    const [editPkg, setEditPkg] = useState(null);
    const [deletePkg, setDeletePkg] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchPackages(); }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/memberships/packages');
            setPackages(data);
        } catch {
            showToast('Failed to load packages', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => { setForm(EMPTY_FORM); setShowAdd(true); };
    const openEdit = (p) => {
        setEditPkg(p);
        setForm({
            name: p.name || '', duration_months: p.duration_months || '',
            price: p.price || '', description: p.description || '', status: p.status || 'active'
        });
    };

    const handleAdd = async () => {
        if (!form.name || !form.duration_months || !form.price) {
            showToast('Name, duration, and price are required', 'error');
            return;
        }
        setSaving(true);
        try {
            await axiosInstance.post('/memberships/packages', { 
                ...form, 
                price: parseFloat(form.price),
                duration_months: parseInt(form.duration_months)
            });
            showToast('Package created', 'success');
            setShowAdd(false);
            fetchPackages();
        } catch {
            showToast('Failed to create package', 'error');
        } finally { setSaving(false); }
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await axiosInstance.put(`/memberships/packages/${editPkg._id}`, { 
                ...form, 
                price: parseFloat(form.price),
                duration_months: parseInt(form.duration_months)
            });
            showToast('Package updated', 'success');
            setEditPkg(null);
            fetchPackages();
        } catch {
            showToast('Failed to update package', 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await axiosInstance.delete(`/memberships/packages/${deletePkg._id}`);
            showToast('Package deleted', 'success');
            setDeletePkg(null);
            fetchPackages();
        } catch {
            showToast('Failed to delete package', 'error');
        } finally { setSaving(false); }
    };

    const handleToggleStatus = async (pkg) => {
        try {
            const { data } = await axiosInstance.patch(`/memberships/packages/${pkg._id}/toggle`);
            showToast(data.message, 'success');
            fetchPackages();
        } catch {
            showToast('Failed to toggle status', 'error');
        }
    };

    const PackageForm = ({ onSubmit, submitLabel }) => (
        <div className="space-y-4">
            <div>
                <label className="text-sm text-slate-400 mb-1 block">Package Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" placeholder="e.g. Basic" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm text-slate-400 mb-1 block">Duration (Months) *</label>
                    <select value={form.duration_months} onChange={e => setForm({ ...form, duration_months: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm">
                        <option value="">Select duration</option>
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months (1 Year)</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm text-slate-400 mb-1 block">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" min="0" step="0.01" />
                </div>
            </div>
            <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm resize-none" rows={3}
                    placeholder="Package description..." />
            </div>
            <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowAdd(false); setEditPkg(null); }}
                    className="flex-1 py-2.5 rounded-xl border border-gym-border text-slate-300 text-sm font-medium hover:bg-white/5 transition-all">
                    Cancel
                </button>
                <button onClick={onSubmit} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50">
                    {saving ? 'Saving…' : submitLabel}
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FiCreditCard /> Membership Packages
                    </h1>
                    <p className="text-slate-400 mt-1">{packages.length} total packages</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all">
                    <FiPlus size={16} /> Add Package
                </button>
            </div>

            {/* Packages Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : packages.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center text-slate-500">No membership packages found</div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {packages.map(pkg => (
                        <div key={pkg._id} className={`glass rounded-2xl p-6 relative group transition-all duration-300 ${pkg.status !== 'active' ? 'opacity-60 grayscale' : 'card-hover'}`}>
                            
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    pkg.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                                }`}>
                                    {pkg.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                    ${pkg.status === 'active' ? 'bg-gradient-to-br from-red-600 to-red-800 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                    <FiCreditCard size={18} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                            <p className="text-2xl font-black gradient-text mb-1">₹{pkg.price}</p>
                            <p className="text-xs text-slate-500 mb-3">{pkg.duration_months} Month(s)</p>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-4">{pkg.description || 'No description'}</p>

                            {/* Actions overlay */}
                            <div className="flex gap-2 justify-center pt-3 border-t border-gym-border/50">
                                <button onClick={() => setViewPkg(pkg)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-blue-400" title="View">
                                    <FiEye size={16} />
                                </button>
                                <button onClick={() => handleToggleStatus(pkg)} className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 ${pkg.status === 'active' ? 'text-slate-400 hover:text-orange-400' : 'text-slate-400 hover:text-green-400'}`} title={pkg.status === 'active' ? 'Deactivate' : 'Activate'}>
                                    <FiPower size={16} />
                                </button>
                                <button onClick={() => openEdit(pkg)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-yellow-400" title="Edit">
                                    <FiEdit2 size={16} />
                                </button>
                                <button onClick={() => setDeletePkg(pkg)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400" title="Delete">
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Membership Package">
                <PackageForm onSubmit={handleAdd} submitLabel="Create Package" />
            </Modal>

            {/* View Modal */}
            <Modal isOpen={!!viewPkg} onClose={() => setViewPkg(null)} title="Package Details">
                {viewPkg && (
                    <div className="space-y-3">
                        {[
                            ['Package Name', viewPkg.name],
                            ['Duration', `${viewPkg.duration_months} Month(s)`],
                            ['Price', `₹${viewPkg.price}`],
                            ['Status', viewPkg.status.toUpperCase()],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between py-2 border-b border-gym-border/50">
                                <span className="text-slate-500 text-sm">{label}</span>
                                <span className="text-white text-sm font-medium">{val}</span>
                            </div>
                        ))}
                        <div className="pt-2">
                            <p className="text-slate-500 text-sm mb-1">Description</p>
                            <p className="text-slate-300 text-sm">{viewPkg.description || 'No description'}</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editPkg} onClose={() => setEditPkg(null)} title="Edit Package">
                <PackageForm onSubmit={handleSaveEdit} submitLabel="Save Changes" />
            </Modal>

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!deletePkg}
                onClose={() => setDeletePkg(null)}
                onConfirm={handleDelete}
                title="Delete Package"
                message={`Are you sure you want to delete "${deletePkg?.name}"? This action cannot be undone.`}
                loading={saving}
            />
        </AdminLayout>
    );
}
