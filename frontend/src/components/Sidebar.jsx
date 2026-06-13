import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiGrid, FiActivity, FiCreditCard, FiUsers, FiUser } from 'react-icons/fi';

export default function Sidebar() {
    const { isAdmin } = useAuth();

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-gradient-to-r from-red-600/20 to-red-800/20 text-white border border-red-600/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`;

    return (
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] pt-20 px-4">
            <div className="sticky top-20 space-y-1">
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-4 px-4">Menu</p>
                <NavLink to="/dashboard" className={linkClass}><FiGrid size={18} /> Dashboard</NavLink>
                <NavLink to="/profile" className={linkClass}><FiUser size={18} /> Profile</NavLink>
                <NavLink to="/workouts" className={linkClass}><FiActivity size={18} /> Workouts</NavLink>
                <NavLink to="/trainers" className={linkClass}><FiUsers size={18} /> Trainers</NavLink>
                
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2 mt-6 px-4">Membership</p>
                <NavLink to="/membership-dashboard" className={linkClass}><FiCreditCard size={18} /> My Membership</NavLink>
                <NavLink to="/membership" className={linkClass}><FiCreditCard size={18} /> Packages</NavLink>
            </div>
        </aside>
    );
}
