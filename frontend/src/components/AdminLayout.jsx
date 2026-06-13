import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiGrid, FiUsers, FiAward, FiCreditCard, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';
import { useState } from 'react';

const NAV_ITEMS = [
    { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/trainers', icon: FiAward, label: 'Trainers' },
    { to: '/admin/memberships', icon: FiCreditCard, label: 'Packages' },
    { to: '/admin/members', icon: FiUsers, label: 'Members' },
    { to: '/admin/reports', icon: FiGrid, label: 'Reports' },
];

export default function AdminLayout({ children }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-gradient-to-r from-red-600/20 to-red-800/20 text-white border border-red-600/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`;

    return (
        <div className="min-h-screen bg-gym-dark flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-64 min-h-screen glass border-r border-gym-border">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gym-border">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                        <FiShield className="text-white" size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-bold gradient-text">Rise & Rep</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin Panel</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3 px-4">Navigation</p>
                    {NAV_ITEMS.map(item => (
                        <NavLink key={item.to} to={item.to} className={linkClass}>
                            <item.icon size={18} /> {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gym-border">
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                        <FiLogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-gym-border">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                            <FiShield className="text-white" size={14} />
                        </div>
                        <span className="text-sm font-bold gradient-text">Admin Panel</span>
                    </div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300">
                        {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {sidebarOpen && (
                    <div className="glass border-t border-gym-border p-4 space-y-1">
                        {NAV_ITEMS.map(item => (
                            <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={linkClass}>
                                <item.icon size={18} /> {item.label}
                            </NavLink>
                        ))}
                        <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                            <FiLogOut size={18} /> Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 pt-20 lg:pt-10 overflow-auto">
                {children}
            </main>
        </div>
    );
}
