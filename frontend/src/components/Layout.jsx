import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import cisllogo from '../assets/cisllogo.jpeg';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [theme, setTheme] = useState('dark');

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-300">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative lg:ml-72">
                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 w-full bg-[#0d1210]/80 backdrop-blur-md z-40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    {/* <h1 className="text-xl font-black text-white tracking-tighter">CISL</h1> */}
                    <img src={cisllogo} className='w-20 h-20 border rounded-full' alt="cisllogo" />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-10 pt-24 lg:pt-10">
                    <div className="mx-auto max-w-[1400px]">
                        <Outlet context={{ theme, toggleTheme }} />
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;

