import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, Edit2, Trash2, Eye, UserPlus, GraduationCap, Banknote, Sparkles, CheckCircle2, Wallet, Check, X, Calendar, MapPin, Activity, DollarSign, Award } from 'lucide-react';
import Modal from '../components/Modal';
import { studentAPI, courseAPI } from '../api';


const LeadsPage = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', course: '', reply: 'Interested', additionalInfo: '', reminderDate: '', remind: false
    });

    // Admit Form State
    const [admitData, setAdmitData] = useState({
        joiningDate: new Date().toISOString().split('T')[0],
        fee: '',
        referralBonus: '0',
        referredBy: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getAll();
            // Filter only leads
            setStudents(response.data.filter(s => !s.isAdmitted));
        } catch (err) {
            console.error("Error fetching students:", err);
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

    const handleAdd = () => {
        setFormData({ name: '', email: '', phone: '', course: '', reply: 'Interested', additionalInfo: '', reminderDate: '', remind: false });
        setIsAddModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditModalOpen) {
                await studentAPI.update(selectedStudent._id, formData);
            } else {
                await studentAPI.add({ ...formData, date: new Date().toISOString().split('T')[0] });
            }
            fetchStudents();
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Error saving student:", err);
        }
    };

    const handleAdmit = (student) => {
        setSelectedStudent(student);

        // Find the course fee for auto-fill
        const matchedCourse = courses.find(c => c.name === student.course || c.courseCode === student.course);
        const courseFee = matchedCourse ? matchedCourse.fees.total : '';

        setAdmitData({
            joiningDate: new Date().toISOString().split('T')[0],
            fee: courseFee,
            referralBonus: '0',
            referredBy: ''
        });
        setIsAdmitModalOpen(true);
    };

    const confirmAdmit = async (e) => {
        e.preventDefault();
        try {
            await studentAPI.admit(selectedStudent._id, admitData);
            fetchStudents();
            setIsAdmitModalOpen(false);
        } catch (err) {
            console.error("Error admitting student:", err);
        }
    };

    const handleView = (student) => {
        setSelectedStudent(student);
        setIsViewModalOpen(true);
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setFormData({ ...student });
        setIsEditModalOpen(true);
    };

    const handleDelete = (student) => {
        setSelectedStudent(student);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await studentAPI.delete(selectedStudent._id);
            fetchStudents();
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error("Error deleting student:", err);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-8 fade-in pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Leads</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage student records and engagement status.</p>
                </div>
            </div>

            {/* Top Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="relative group flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search students by name, email, or phone..."
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-2xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleAdd} className="px-6 py-2.5 bg-emerald-500 text-black rounded-full font-black text-sm hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Plus className="w-4 h-4" /> Add Student
                    </button>
                    <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            {/* Premium Table Container */}
            <div className="glass-card overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-6 py-5 w-10">
                                    <div className="w-5 h-5 rounded-full border-2 border-white/10 cursor-pointer" />
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Reply</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="w-5 h-5 rounded-full border-2 border-white/10 group-hover:border-emerald-500/50 transition-all cursor-pointer" />
                                    </td>
                                    <td className="px-6 py-6 text-sm font-bold text-slate-400">
                                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[11px] font-black text-emerald-500 uppercase">
                                                {student.name ? student.name.split(' ').filter(Boolean).map(n => n[0]).join('') : '?'}
                                            </div>
                                            <span className="text-sm font-black text-white uppercase tracking-tight">{student.name || 'Unknown'}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-6 text-sm font-bold text-slate-400 italic">{student.phone}</td>
                                    <td className="px-6 py-6 text-sm font-bold text-slate-500">{student.email}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-slate-400 max-w-[200px] truncate">
                                                {student.additionalInfo || 'No reply recorded...'}
                                            </span>
                                            <button
                                                onClick={() => handleAdmit(student)}
                                                className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all"
                                            >
                                                Join
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => handleEdit(student)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleView(student)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(student)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center text-slate-500 font-bold italic">
                                        No leads found matching your criteria...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI */}
                <div className="px-8 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01]">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Showing 1 to {filteredStudents.length} of {students.length} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-500 hover:text-white transition-all cursor-pointer">
                            <X className="w-3.5 h-3.5 rotate-90" /> {/* Chevron Left proxy */}
                        </button>
                        <button className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[11px] font-black">1</button>
                        <button className="w-8 h-8 rounded-full hover:bg-white/5 text-slate-500 flex items-center justify-center text-[11px] font-bold transition-all">2</button>
                        <button className="w-8 h-8 rounded-full hover:bg-white/5 text-slate-500 flex items-center justify-center text-[11px] font-bold transition-all">3</button>
                        <span className="text-slate-500 text-xs px-1">...</span>
                        <button className="w-8 h-8 rounded-full hover:bg-white/5 text-slate-500 flex items-center justify-center text-[11px] font-bold transition-all">10</button>
                        <button className="p-2 text-slate-500 hover:text-white transition-all cursor-pointer">
                            <X className="w-3.5 h-3.5 -rotate-90" /> {/* Chevron Right proxy */}
                        </button>
                    </div>
                </div>
            </div>


            {/* Modals */}
            <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} title={isEditModalOpen ? "Edit Lead" : "Add New Lead"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label>
                            <input
                                className="input-field"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                            <input
                                className="input-field"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone</label>
                            <input
                                className="input-field"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Interested Course</label>
                            <select
                                className="input-field"
                                value={formData.course || ''}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                required
                            >
                                <option value="">Select a Course</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course.name}>{course.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Status</label>
                        <select
                            className="input-field"
                            value={formData.reply || 'Interested'}
                            onChange={(e) => setFormData({ ...formData, reply: e.target.value })}
                        >
                            <option value="Interested">Interested</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Not Interested">Not Interested</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Additional Info</label>
                        <textarea
                            className="input-field resize-none"
                            rows={3}
                            value={formData.additionalInfo || ''}
                            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="flex justify-end pt-6 gap-3">
                        <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Save Lead</button>
                    </div>
                </form>
            </Modal>

            {/* Admit Modal */}
            <Modal isOpen={isAdmitModalOpen} onClose={() => setIsAdmitModalOpen(false)} title="Convert Lead to Student" maxWidth="max-w-2xl">
                <form onSubmit={confirmAdmit} className="space-y-10 pb-4">
                    {/* Lead Info Header Card */}
                    <div className="p-5 rounded-3xl bg-white/2 border border-white/5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl font-bold border border-emerald-500/20">
                            {selectedStudent?.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white">{selectedStudent?.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead #{(selectedStudent?._id || '0000').slice(-4)}</span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-tighter">Ready to Join</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Course Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                            <GraduationCap className="w-5 h-5 text-emerald-500" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Course Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Select Course</label>
                                <select
                                    className="input-field"
                                    value={admitData.course || selectedStudent?.course || ''}
                                    onChange={(e) => setAdmitData({ ...admitData, course: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a specialized track</option>
                                    {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Start Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="input-field pr-10"
                                        value={admitData.joiningDate}
                                        onChange={(e) => setAdmitData({ ...admitData, joiningDate: e.target.value })}
                                        required
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Payment & Fees */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                            <Banknote className="w-5 h-5 text-emerald-500" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Payment & Fees</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Agreed Total Fee ($)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="input-field pl-10"
                                        placeholder="0.00"
                                        value={admitData.fee}
                                        onChange={(e) => setAdmitData({ ...admitData, fee: e.target.value })}
                                        required
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Upfront Payment ($)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="input-field pl-10"
                                        placeholder="0.00"
                                        defaultValue="0"
                                    />
                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Referral Program */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Referral Program</h4>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Has Referral?</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={!!admitData.referredBy} onChange={(e) => setAdmitData({ ...admitData, referredBy: e.target.checked ? ' ' : '' })} />
                                    <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white border border-white/10"></div>
                                </label>
                            </div>
                        </div>

                        {(admitData.referredBy !== '') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Referral Source</label>
                                    <div className="relative">
                                        <input
                                            className="input-field pl-10"
                                            placeholder="Search student name..."
                                            value={admitData.referredBy}
                                            onChange={(e) => setAdmitData({ ...admitData, referredBy: e.target.value })}
                                        />
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Bonus Credit ($)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        placeholder="50.00"
                                        value={admitData.referralBonus}
                                        onChange={(e) => setAdmitData({ ...admitData, referralBonus: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={() => setIsAdmitModalOpen(false)} className="px-8 py-3 rounded-2xl border border-white/10 text-slate-400 font-black text-sm hover:bg-white/5 transition-all">Cancel</button>
                        <button type="submit" className="px-10 py-3 bg-emerald-500 text-black rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Save & Convert
                        </button>
                    </div>
                </form>
            </Modal>


            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Student Details" maxWidth="max-w-4xl">
                {selectedStudent && (
                    <div className="p-8 space-y-12 pb-6">
                        {/* Profile Header Block */}
                        <div className="flex flex-col md:flex-row items-center gap-8 border-b border-white/5 pb-10">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative w-32 h-32 rounded-full border-4 border-[#0d1210] overflow-hidden bg-slate-800">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-[#0d1210] rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-2">
                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    <h2 className="text-4xl font-black text-white tracking-tight leading-none uppercase">{selectedStudent.name}</h2>
                                    <span className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Interested - Lead
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-slate-500">{selectedStudent.course || 'Unassigned Course'} • Batch 2024</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                        Inquired {new Date(selectedStudent.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                        <MapPin className="w-4 h-4 text-emerald-500" />
                                        Location Unspecified
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Personal Information Column */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                    <Users className="w-5 h-5 text-emerald-500" />
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Personal Information</h4>
                                </div>
                                <div className="space-y-6 pl-2">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                                        <p className="text-lg font-bold text-slate-300 italic">{selectedStudent.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                                        <p className="text-lg font-bold text-slate-300 italic font-mono tracking-tight">{selectedStudent.phone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Course Name</label>
                                        <p className="text-lg font-bold text-emerald-500">{selectedStudent.course}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Financial & Referral Column */}
                            <div className="space-y-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Financial Details</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 rounded-3xl bg-white/2 border border-white/5 hover:bg-white/[0.04] transition-colors">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estimated Fee</p>
                                            <p className="text-2xl font-black text-white">₹0.00</p>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Inquiry Stat</p>
                                                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                            </div>
                                            <p className="text-2xl font-black text-white uppercase tracking-tighter">{selectedStudent.reply}</p>
                                            <span className="text-[10px] font-bold text-slate-500">(Pending)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Referral Info</h4>
                                    <div className="p-4 rounded-3xl bg-white/2 border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden bg-slate-800">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Referrer`} alt="" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Referred By</p>
                                                <p className="text-sm font-bold text-white uppercase">Direct Inquiry</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bonus</p>
                                            <p className="text-sm font-black text-emerald-500 tracking-tighter">+₹0.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-4 pt-10 border-t border-white/5">
                            <button className="px-8 py-3 rounded-full bg-white/5 text-white font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                                Report Issue
                            </button>
                            <button onClick={() => setIsViewModalOpen(false)} className="px-12 py-3 bg-emerald-500 text-black rounded-full font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>


            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
                <div className="space-y-6">
                    <p className="text-slate-600 leading-relaxed">Are you sure you want to delete <span className="font-bold text-slate-900">{selectedStudent?.name}</span>? This action is permanent.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button onClick={confirmDelete} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LeadsPage;
