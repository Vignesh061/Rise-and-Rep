import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useToast from '../../hooks/useToast';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'Fitness', 'Strength Training'];

export default function AdminUsers() {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [viewUser, setViewUser] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [deleteUser, setDeleteUser] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (q = '') => {
        setLoading(true);
        try {
            const url = q ? `/auth/users?q=${encodeURIComponent(q)}` : '/auth/users';
            const { data } = await axiosInstance.get(url);
            setUsers(data);
        } catch {
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handleEdit = (user) => {
        setEditUser(user);
        setEditForm({
            name: user.name || '',
            age: user.age || '',
            mobile: user.mobile || '',
            fitness_goal: user.fitness_goal || '',
            status: user.status || 'active',
        });
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await axiosInstance.put(`/auth/users/${editUser._id}`, editForm);
            showToast('User updated', 'success');
            setEditUser(null);
            fetchUsers(search);
        } catch {
            showToast('Failed to update user', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await axiosInstance.delete(`/auth/users/${deleteUser._id}`);
            showToast('User deleted', 'success');
            setDeleteUser(null);
            fetchUsers(search);
        } catch {
            showToast('Failed to delete user', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FiUsers /> User Management
                    </h1>
                    <p className="text-slate-400 mt-1">{users.length} total users</p>
                </div>
                <form onSubmit={handleSearch} className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white placeholder-slate-500 text-sm w-72"
                    />
                </form>
            </div>

            {/* Users Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-gym-border bg-white/5">
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium hidden md:table-cell">Mobile</th>
                                <th className="px-6 py-4 font-medium hidden lg:table-cell">Fitness Goal</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                </td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No users found</td></tr>
                            ) : users.map(user => (
                                <tr key={user._id} className="border-b border-gym-border/50 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{user.email}</td>
                                    <td className="px-6 py-4 text-slate-400 hidden md:table-cell">{user.mobile || '—'}</td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-600/10 text-red-400">
                                            {user.fitness_goal || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${user.status === 'active'
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setViewUser(user)} title="View"
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors">
                                                <FiEye size={16} />
                                            </button>
                                            <button onClick={() => handleEdit(user)} title="Edit"
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-yellow-400 transition-colors">
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button onClick={() => setDeleteUser(user)} title="Delete"
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

            {/* View Modal */}
            <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details">
                {viewUser && (
                    <div className="space-y-3">
                        {[
                            ['Name', viewUser.name],
                            ['Email', viewUser.email],
                            ['Age', viewUser.age],
                            ['Gender', viewUser.gender],
                            ['Mobile', viewUser.mobile],
                            ['Fitness Goal', viewUser.fitness_goal],
                            ['Status', viewUser.status],
                            ['Height', viewUser.height ? `${viewUser.height} cm` : null],
                            ['Weight', viewUser.weight ? `${viewUser.weight} kg` : null],
                            ['BMI', viewUser.bmi],
                            ['Joined', viewUser.created_at ? new Date(viewUser.created_at).toLocaleDateString() : null],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between py-2 border-b border-gym-border/50">
                                <span className="text-slate-500 text-sm">{label}</span>
                                <span className="text-white text-sm font-medium">{val || '—'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Name</label>
                        <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Age</label>
                            <input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Status</label>
                            <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Mobile</label>
                        <input type="tel" value={editForm.mobile} onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Fitness Goal</label>
                        <select value={editForm.fitness_goal} onChange={e => setEditForm({ ...editForm, fitness_goal: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gym-border text-white text-sm">
                            <option value="">Select</option>
                            {FITNESS_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setEditUser(null)}
                            className="flex-1 py-2.5 rounded-xl border border-gym-border text-slate-300 text-sm font-medium hover:bg-white/5 transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSaveEdit} disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50">
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!deleteUser}
                onClose={() => setDeleteUser(null)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone.`}
                loading={saving}
            />
        </AdminLayout>
    );
}
