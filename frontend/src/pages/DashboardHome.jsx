import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserPlus, Clock, Zap, Search, Bell, Settings, Plus, MoreHorizontal, Download, Calendar, Database, Shield, Activity, X } from 'lucide-react';
import { dashboardAPI, studentAPI, courseAPI } from '../api';
import Modal from '../components/Modal';

const DashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        interestedCount: 0,
        pendingReminders: 0,
        successRate: 0,
        revenue: 0,
        potentialRevenue: 0,
        referrals: 0,
        statusBreakdown: [],
        allCourses: []
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [upcomingReminders, setUpcomingReminders] = useState([]);
    const [courseData, setCourseData] = useState([]);
    const [engagementData, setEngagementData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', course: '', reply: 'Interested', additionalInfo: ''
    });

    useEffect(() => {
        fetchDashboardData();
        fetchCourses();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getStats();
            const {
                totalStudents, interestedCount, pendingReminders,
                successRate, revenue, potentialRevenue, referrals,
                statusBreakdown, recentActivity, upcomingReminders,
                studentData, engagementData, allCourses
            } = response.data;

            setStats({
                totalStudents,
                interestedCount,
                pendingReminders,
                successRate,
                revenue,
                potentialRevenue,
                referrals,
                statusBreakdown: statusBreakdown || [],
                allCourses: allCourses || []
            });
            setRecentActivity(recentActivity);
            setUpcomingReminders(upcomingReminders || []);
            // Fallback data for Popular Facilities if DB is empty
            const fallbackCourseData = [
                { name: 'Full Stack Dev', count: 35 },
                { name: 'Data Science', count: 28 },
                { name: 'UI/UX Design', count: 22 },
                { name: 'Cyber Security', count: 18 },
                { name: 'Digital Marketing', count: 15 }
            ];
            setCourseData(studentData && studentData.length > 0 ? studentData : fallbackCourseData);
            setEngagementData(engagementData);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await courseAPI.getAll();
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };

    const handleQuickAdmit = async (e) => {
        e.preventDefault();
        try {
            await studentAPI.add({ ...formData, date: new Date().toISOString().split('T')[0] });
            setIsAddModalOpen(false);
            fetchDashboardData();
            setFormData({ name: '', email: '', phone: '', course: '', reply: 'Interested', additionalInfo: '' });
        } catch (err) {
            alert("Failed to add student. Please check all fields.");
        }
    };

    const exportData = async () => {
        try {
            const response = await studentAPI.getAll();
            const students = response.data;

            const headers = ['Name', 'Phone', 'Email', 'Course', 'Status', 'Admitted', 'Fee', 'Joining Date'];
            const csvData = students.map(s => [
                s.name,
                s.phone,
                s.email,
                s.course,
                s.reply,
                s.isAdmitted ? 'Yes' : 'No',
                s.fee || 0,
                s.joiningDate ? new Date(s.joiningDate).toLocaleDateString() : 'N/A'
            ]);

            const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `student_report_${new Date().toLocaleDateString()}.csv`);
            link.click();
        } catch (err) {
            alert("Failed to export data");
        }
    };

    const filteredActivity = recentActivity.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.phone && activity.phone.includes(searchTerm))
    );

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents, change: '+12%', icon: Users },
        { title: 'Interested Leads', value: stats.interestedCount, change: '+5%', icon: UserPlus },
        { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, change: '+15%', icon: Zap },
        { title: 'Potential Rev.', value: `₹${stats.potentialRevenue.toLocaleString()}`, change: 'Target', icon: Activity },
    ];

    return (
        <div className="space-y-8 fade-in pb-10">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Facilities Overview</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">Detailed breakdown of your current data assets</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all w-48"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={exportData} className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-white/5 flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        <span className="text-xs font-bold hidden lg:inline">Export CSV</span>
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                        <Plus className="w-5 h-5" />
                        <span>Quick Admit</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="glass-card p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${stat.change.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/10 text-white/60'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Database Inventory Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <Database className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Database Inventory</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {stats.statusBreakdown.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/leads')}>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item._id || 'UNSET'}</p>
                                <p className="text-2xl font-black text-white">{item.count}</p>
                                <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(item.count / (stats.totalStudents || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-8 scroll-glass">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        Available Facilities
                    </h3>
                    <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                        {stats.allCourses.length > 0 ? stats.allCourses.map((course, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-slate-400 hover:text-white hover:border-emerald-500/30 transition-all cursor-pointer">
                                {course}
                            </span>
                        )) : (
                            <p className="text-xs text-slate-500 italic">No facilities detected</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Engagement Area Chart */}
                <div className="lg:col-span-2 glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white">Enrollment Trends</h3>
                            <p className="text-sm text-slate-500 font-medium">Real-time registration activity</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={engagementData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dy={10} />
                                <YAxis hide={true} />
                                <Tooltip contentStyle={{ backgroundColor: '#121816', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Reminders */}
                <div className="glass-card p-8 text-white">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Upcoming Reminders</h3>
                            <p className="text-sm text-slate-500 font-medium italic">Pending follow-ups</p>
                        </div>
                        <Calendar className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                        {upcomingReminders.length > 0 ? upcomingReminders.map((rem, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group" onClick={() => navigate('/leads')}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-500 transition-colors">{rem.name}</h4>
                                    <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                        {new Date(rem.reminderDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium truncate italic">{rem.course}</p>
                            </div>
                        )) : (
                            <div className="py-10 text-center">
                                <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                <p className="text-xs text-slate-500 font-bold">No reminders scheduled</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white">Recent Activity Feed</h3>
                        <button onClick={() => navigate('/leads')} className="text-xs font-bold text-emerald-500 hover:text-emerald-400">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="custom-table text-white">
                            <thead>
                                <tr className="header-row">
                                    <th>Student</th>
                                    <th>Facility/Course</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredActivity.map((activity) => (
                                    <tr key={activity._id} className="cursor-pointer hover:bg-white/2 transition-colors" onClick={() => { setSelectedStudent(activity); setIsViewModalOpen(true); }}>
                                        <td className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs ring-1 ring-emerald-500/20">
                                                {activity.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-white whitespace-nowrap uppercase">{activity.name}</span>
                                        </td>
                                        <td className="text-sm text-slate-400 font-medium">{activity.course}</td>
                                        <td>
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${activity.isAdmitted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {activity.isAdmitted ? 'ENROLLED' : activity.reply.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                            {new Date(activity.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Course Popularity Bar Chart */}
                <div className="glass-card p-8 text-white">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold">Popular Facilities</h3>
                        <p className="text-sm text-slate-500 font-medium whitespace-nowrap">Student distribution across top 5</p>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={courseData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dy={10} />
                                <YAxis hide={true} />
                                <Tooltip contentStyle={{ backgroundColor: '#121816', border: 'none', borderRadius: '12px' }} />
                                <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={24}>
                                    {courseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : 'rgba(255,255,255,0.05)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Quick Admission / Lead">
                <form onSubmit={handleQuickAdmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Name</label>
                            <input className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Phone</label>
                            <input className="input-field" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email</label>
                            <input className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Course</label>
                            <select className="input-field" value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} required>
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Initial Status</label>
                        <select className="input-field" value={formData.reply} onChange={(e) => setFormData({ ...formData, reply: e.target.value })}>
                            <option value="Interested">Interested</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Busy">Busy</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Create Entry</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Data Point Details">
                {selectedStudent && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white">{selectedStudent.name}</h3>
                                    <p className="text-emerald-500 font-bold text-sm tracking-widest uppercase">{selectedStudent.course}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black ${selectedStudent.isAdmitted ? 'bg-emerald-500 text-black' : 'bg-amber-500/20 text-amber-500'}`}>
                                    {selectedStudent.isAdmitted ? 'ENROLLED' : selectedStudent.reply.toUpperCase()}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Phone Reference</p>
                                    <p className="text-white font-bold">{selectedStudent.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Email Channel</p>
                                    <p className="text-white font-bold">{selectedStudent.email || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Additional Intelligence</p>
                                    <p className="text-slate-400 text-sm italic">"{selectedStudent.additionalInfo || 'No additional data points recorded for this entry.'}"</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => setIsViewModalOpen(false)} className="btn-primary">Acknowledge</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DashboardHome;
