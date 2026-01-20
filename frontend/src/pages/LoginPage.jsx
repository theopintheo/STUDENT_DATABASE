import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { authAPI } from '../api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.login(formData);
            const { token, data } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err) {
            console.error("Login failed:", err);
            alert(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1612] relative overflow-hidden font-['Inter']">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-[420px] px-6">
                <div className="bg-[#1a221f] rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/5">
                    {/* Header Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-[#1f2b26] rounded-full flex items-center justify-center border border-white/5">
                            <div className="bg-emerald-500/20 p-3 rounded-full">
                                <User className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-white mb-3">Admin Portal</h1>
                        <p className="text-gray-400 text-sm">Please sign in to continue to the student database.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300 block">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    className="w-full bg-[#131a17] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="user@university.edu"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300 block">Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-[#131a17] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all pr-12"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#22c55e] text-[#0d1612] font-bold py-3.5 rounded-xl hover:bg-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing In...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer for Card */}
                    <div className="mt-8 text-center text-xs text-gray-500 border-t border-white/5 pt-6">
                        © 2024 School Management Systems. <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
