import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                            <span className="text-white font-black text-lg">R</span>
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">Rise & Rep</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                                <Link to="/workouts" className="text-sm text-slate-300 hover:text-white transition-colors">Workouts</Link>
                                <Link to="/membership" className="text-sm text-slate-300 hover:text-white transition-colors">Membership</Link>
                                <Link to="/trainers" className="text-sm text-slate-300 hover:text-white transition-colors">Trainers</Link>
                                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gym-border">
                                    <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                                            <FiUser className="text-white text-sm" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">{user.name}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors" title="Logout">
                                        <FiLogOut size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Login</Link>
                                <Link to="/register" className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 transition-all">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button className="md:hidden text-slate-300" onClick={() => setOpen(!open)}>
                        {open ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden glass border-t border-gym-border">
                    <div className="px-4 py-4 space-y-3">
                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white">Dashboard</Link>
                                <Link to="/profile" onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white">Profile</Link>
                                <Link to="/workouts" onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white">Workouts</Link>
                                <Link to="/membership" onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white">Membership</Link>
                                <Link to="/trainers" onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white">Trainers</Link>
                                <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white">Login</Link>
                                <Link to="/register" onClick={() => setOpen(false)} className="block text-red-500 font-semibold">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
