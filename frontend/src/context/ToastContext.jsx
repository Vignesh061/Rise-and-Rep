import { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto toast-enter flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-xl border
                            ${toast.type === 'success'
                                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                                : toast.type === 'error'
                                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                                    : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                            }`}
                    >
                        <span className="text-base">
                            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
                        </span>
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-xs"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
