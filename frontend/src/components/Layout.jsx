import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#0a0f0d] overflow-hidden text-white font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden relative lg:ml-72">
                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 w-full bg-[#0d1210]/80 backdrop-blur-md z-40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-black text-white tracking-tighter">EduTrack</h1>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-10 pt-24 lg:pt-10">
                    <div className="mx-auto max-w-[1400px]">
                        <Outlet />
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

