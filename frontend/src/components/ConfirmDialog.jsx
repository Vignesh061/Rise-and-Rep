import Modal from './Modal';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'} maxWidth="max-w-sm">
            <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                    <FiAlertTriangle className="text-red-400" size={24} />
                </div>
                <p className="text-slate-300 text-sm mb-6">
                    {message || 'Are you sure you want to proceed? This action cannot be undone.'}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gym-border text-slate-300 font-medium text-sm hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
