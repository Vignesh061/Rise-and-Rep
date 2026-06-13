import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Workout from './pages/Workout';
import Membership from './pages/Membership';
import MembershipDashboard from './pages/MembershipDashboard';
import MembershipHistory from './pages/MembershipHistory';
import Invoice from './pages/Invoice';
import TrainerBooking from './pages/TrainerBooking';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTrainers from './pages/admin/AdminTrainers';
import AdminMemberships from './pages/admin/AdminMemberships';
import AdminMembers from './pages/admin/AdminMembers';
import AdminExpiringMembers from './pages/admin/AdminExpiringMembers';
import AdminExpiredMembers from './pages/admin/AdminExpiredMembers';
import AdminReports from './pages/admin/AdminReports';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
    const { user, loading, isAdmin } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (!user || !isAdmin()) return <Navigate to="/admin/login" replace />;
    return children;
}

export default function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen bg-gym-dark">
            {/* Hide Navbar on admin routes — admin uses its own sidebar layout */}
            {!isAdminRoute && <Navbar />}

            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected User Routes */}
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/workouts" element={<PrivateRoute><Workout /></PrivateRoute>} />
                <Route path="/trainers" element={<PrivateRoute><TrainerBooking /></PrivateRoute>} />
                
                {/* Membership Routes */}
                <Route path="/membership" element={<PrivateRoute><Membership /></PrivateRoute>} />
                <Route path="/membership-dashboard" element={<PrivateRoute><MembershipDashboard /></PrivateRoute>} />
                <Route path="/membership-history" element={<PrivateRoute><MembershipHistory /></PrivateRoute>} />
                <Route path="/invoice/:membershipId" element={<PrivateRoute><Invoice /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/trainers" element={<AdminRoute><AdminTrainers /></AdminRoute>} />
                
                {/* Admin Membership Routes */}
                <Route path="/admin/memberships" element={<AdminRoute><AdminMemberships /></AdminRoute>} />
                <Route path="/admin/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
                <Route path="/admin/expiring-members" element={<AdminRoute><AdminExpiringMembers /></AdminRoute>} />
                <Route path="/admin/expired-members" element={<AdminRoute><AdminExpiredMembers /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}
