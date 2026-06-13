import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useToast from '../../hooks/useToast';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiAward } from 'react-icons/fi';

const SPECIALIZATIONS = ['Weight Loss', 'Muscle Building', 'CrossFit', 'Yoga', 'Cardio', 'Strength Training'];

const EMPTY_FORM = { name: '', specialization: '', experience: '', mobile: '', email: '' };

export default function AdminTrainers() {
    const { showToast } = useToast();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showAdd, setShowAdd] = useState(false);
    const [viewTrainer, setViewTrainer] = useState(null);
    const [editTrainer, setEditTrainer] = useState(null);
    const [deleteTrainer, setDeleteTrainer] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchTrainers(); }, []);

    const fetchTrainers = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/trainers');
            setTrainers(data);
        } catch {
            showToast('Failed to load trainers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => { setForm(EMPTY_FORM); setShowAdd(true); };
    const openEdit = (t) => {
        setEditTrainer(t);
        setForm({
            name: t.name || '', specialization: t.specialization || '',
            experience: t.experience || '', mobile: t.mobile || '', email: t.email || '',
        });
    };

    const handleAdd = async () => {
        if (!form.name || !form.specialization || !form.email) {
            showToast('Name, specialization, and email are required', 'error');
            return;
        }
        setSaving(true);
        try {
            await axiosInstance.post('/trainers', { ...form, experience: parseInt(form.experience) || 0 });
            showToast('Trainer added', 'success');
            setShowAdd(false);
            fetchTrainers();
        } catch {
            showToast('Failed to add trainer', 'error');
        } finally { setSaving(false); }
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await axiosInstance.put(`/trainers/${editTrainer._id}`, { ...form, experience: parseInt(form.experience) || 0 });
            showToast('Trainer updated', 'success');
            setEditTrainer(null);
            fetchTrainers();
        } catch {
            showToast('Failed to update trainer', 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await axiosInstance.delete(`/trainers/${deleteTrainer._id}`);
            showToast('Trainer deleted', 'success');
            setDeleteTrainer(null);
            fetchTrainers();
        } catch {
            showToast('Failed to delete trainer', 'error');
        } finally { setSaving(false); }
    };

    const TrainerForm = ({ onSubmit, submitLabel }) => (
        <div className="space-y-4">
            <div>
                <label className="text-sm text-slate-400 mb-1 block">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" placeholder="Trainer name" />
            </div>
            <div>
                <label className="text-sm text-slate-400 mb-1 block">Specialization *</label>
                <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm">
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm text-slate-400 mb-1 block">Experience (years)</label>
                    <input type="number" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" min="0" />
                </div>
                <div>
                    <label className="text-sm text-slate-400 mb-1 block">Mobile</label>
                    <input type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" />
                </div>
            </div>
            <div>
                <label className="text-sm text-slate-400 mb-1 block">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" placeholder="trainer@email.com" />
            </div>
            <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowAdd(false); setEditTrainer(null); }}
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
                        <FiAward /> Trainer Management
                    </h1>
                    <p className="text-slate-400 mt-1">{trainers.length} total trainers</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all">
                    <FiPlus size={16} /> Add Trainer
                </button>
            </div>

            {/* Trainers Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-gym-border bg-white/5">
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Specialization</th>
                                <th className="px-6 py-4 font-medium hidden md:table-cell">Experience</th>
                                <th className="px-6 py-4 font-medium hidden lg:table-cell">Email</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                </td></tr>
                            ) : trainers.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No trainers found</td></tr>
                            ) : trainers.map(t => (
                                <tr key={t._id} className="border-b border-gym-border/50 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{t.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-600/10 text-red-400">
                                            {t.specialization}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 hidden md:table-cell">{t.experience} yrs</td>
                                    <td className="px-6 py-4 text-slate-400 hidden lg:table-cell">{t.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setViewTrainer(t)} title="View"
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors">
                                                <FiEye size={16} />
                                            </button>
                                            <button onClick={() => openEdit(t)} title="Edit"
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-yellow-400 transition-colors">
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button onClick={() => setDeleteTrainer(t)} title="Delete"
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Trainer">
                <TrainerForm onSubmit={handleAdd} submitLabel="Add Trainer" />
            </Modal>

            {/* View Modal */}
            <Modal isOpen={!!viewTrainer} onClose={() => setViewTrainer(null)} title="Trainer Details">
                {viewTrainer && (
                    <div className="space-y-3">
                        {[
                            ['Name', viewTrainer.name],
                            ['Specialization', viewTrainer.specialization],
                            ['Experience', `${viewTrainer.experience} years`],
                            ['Mobile', viewTrainer.mobile],
                            ['Email', viewTrainer.email],
                            ['Rating', viewTrainer.rating],
                            ['Available', viewTrainer.available ? 'Yes' : 'No'],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between py-2 border-b border-gym-border/50">
                                <span className="text-slate-500 text-sm">{label}</span>
                                <span className="text-white text-sm font-medium">{val || '—'}</span>
                            </div>
                        ))}
                        {viewTrainer.bio && (
                            <div className="pt-2">
                                <p className="text-slate-500 text-sm mb-1">Bio</p>
                                <p className="text-slate-300 text-sm">{viewTrainer.bio}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editTrainer} onClose={() => setEditTrainer(null)} title="Edit Trainer">
                <TrainerForm onSubmit={handleSaveEdit} submitLabel="Save Changes" />
            </Modal>

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!deleteTrainer}
                onClose={() => setDeleteTrainer(null)}
                onConfirm={handleDelete}
                title="Delete Trainer"
                message={`Are you sure you want to delete ${deleteTrainer?.name}? This action cannot be undone.`}
                loading={saving}
            />
        </AdminLayout>
    );
}
