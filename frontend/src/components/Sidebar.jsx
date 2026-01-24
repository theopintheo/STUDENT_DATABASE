import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Share2, LogOut, UserPlus } from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { name: 'Home', icon: Home, path: '/dashboard' },
        { name: 'Leads', icon: UserPlus, path: '/leads' },
        { name: 'Student Details', icon: Users, path: '/students' },
        { name: 'Courses', icon: Home, path: '/courses' },

        { name: 'Share Platform', icon: Share2, path: '/share' },
    ];


    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--bg-sidebar)] border-r border-white/5 flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="px-8 py-10">
                <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `sidebar-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-semibold">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 space-y-4">
                {/* System Status Card */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-slate-300 font-medium">All systems operational</span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-6 py-4 text-slate-400 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-300 group"
                >
                    <LogOut className="w-5 h-5 mr-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm">Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

