import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Calendar, DollarSign, Award, Users, Download, Filter, ChevronDown, Phone, Mail, ChevronLeft, ChevronRight, Activity, MapPin, UserPlus, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { studentAPI } from '../api';

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [leads, setLeads] = useState([]); // State for leads
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Adjust items per page as needed

    // Modal States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLeadSelectionModalOpen, setIsLeadSelectionModalOpen] = useState(false); // New modal
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedLeadForAdmit, setSelectedLeadForAdmit] = useState(null);

    // Filters State
    const [activeTab, setActiveTab] = useState('All Students');
    const [courseFilter, setCourseFilter] = useState('All Courses');
    const [dateFilter, setDateFilter] = useState('All Time');

    // Edit State
    const [formData, setFormData] = useState({ gender: 'Male' });

    // Admit/Add State
    const [admitData, setAdmitData] = useState({
        fee: '',
        joiningDate: new Date().toISOString().split('T')[0],
        referralBonus: '0',
        referredBy: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab, courseFilter, dateFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getAll();
            // Split into students and leads
            setStudents(response.data.filter(s => s.isAdmitted));
            setLeads(response.data.filter(s => !s.isAdmitted));
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setIsLeadSelectionModalOpen(true);
    };

    const handleSelectLead = (lead) => {
        setSelectedLeadForAdmit(lead);
        setIsLeadSelectionModalOpen(false);
        setAdmitData({
            fee: '',
            joiningDate: new Date().toISOString().split('T')[0],
            referralBonus: '0',
            referredBy: ''
        });
        setIsAdmitModalOpen(true);
    };

    const handleAdmitSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLeadForAdmit) return;

        try {
            await studentAPI.admit(selectedLeadForAdmit._id, {
                ...admitData,
                isAdmitted: true,
                status: 'Active'
            });
            fetchData();
            setIsAdmitModalOpen(false);
            setSelectedLeadForAdmit(null);
        } catch (err) {
            console.error("Error admitting student:", err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await studentAPI.update(selectedStudent._id, formData);
            fetchData();
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Error updating student:", err);
        }
    };

    const confirmDelete = async () => {
        try {
            await studentAPI.delete(selectedStudent._id);
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error("Error deleting student:", err);
        }
    };

    const handleExport = () => {
        if (students.length === 0) return;

        const headers = ["ID", "Name", "Email", "Phone", "Course", "Joining Date", "Fee", "Referred By", "Referral Bonus"];
        const csvContent = [
            headers.join(","),
            ...students.map(s => [
                s._id,
                `"${s.name}"`,
                s.email,
                s.phone,
                s.course,
                s.joiningDate ? new Date(s.joiningDate).toLocaleDateString() : '',
                s.fee,
                `"${s.referredBy || ''}"`,
                s.referralBonus
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "admitted_students.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.phone?.includes(searchTerm);

        let matchesTab = true;
        if (activeTab === 'Pending Fees') {
            matchesTab = student.fee && student.fee > 0;
        } else if (activeTab === 'New Joiners') {
            const joinedDate = new Date(student.joiningDate);
            const now = new Date();
            const diffTime = Math.abs(now - joinedDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            matchesTab = diffDays <= 30;
        } else if (activeTab === 'Referral Bonus Pending') {
            matchesTab = student.referralBonus && student.referralBonus > 0;
        }

        let matchesCourse = true;
        if (courseFilter !== 'All Courses') {
            matchesCourse = student.course === courseFilter;
        }

        let matchesDate = true;
        if (dateFilter === 'This Month') {
            const joinedDate = new Date(student.joiningDate);
            const now = new Date();
            matchesDate = joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear();
        }

        return matchesSearch && matchesTab && matchesCourse && matchesDate;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents ? filteredStudents.slice(indexOfFirstItem, indexOfLastItem) : [];
    const totalPages = filteredStudents ? Math.ceil(filteredStudents.length / itemsPerPage) : 0;

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const categories = ['All Students', 'Pending Fees', 'New Joiners', 'Referral Bonus Pending'];
    const uniqueCourses = ['All Courses', ...new Set(students.map(s => s.course).filter(Boolean))];

    return (
        <div className="space-y-6 fade-in pb-10">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest gap-2">
                    <span className="hover:text-emerald-500 transition-colors cursor-pointer">Home</span>
                    <span className="text-slate-700">/</span>
                    <span className="hover:text-emerald-500 transition-colors cursor-pointer">Students</span>
                    <span className="text-slate-700">/</span>
                    <span className="text-white">Joined Details</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Joined Student Details</h1>
                        <p className="text-slate-500 mt-2 font-medium max-w-2xl">Manage and track all enrolled student information, payment status, and referral details.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleExport} className="px-6 py-3 bg-[#131b18] text-slate-300 border border-white/5 rounded-xl font-bold text-sm hover:text-white hover:border-white/10 transition-all flex items-center gap-2 group">
                            <Download className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                            Export
                        </button>
                        <button onClick={handleOpenAdd} className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-black text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Student
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#131b18] p-4 rounded-3xl border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Name, Email, or Phone..."
                        className="w-full bg-[#0a0f0d] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
                    <div className="relative">
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="appearance-none px-4 py-3 bg-[#0a0f0d] border border-white/5 rounded-2xl text-slate-300 text-sm font-bold flex items-center gap-2 hover:border-white/10 pr-10 focus:outline-none cursor-pointer"
                        >
                            {uniqueCourses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => setDateFilter(dateFilter === 'This Month' ? 'All Time' : 'This Month')}
                        className={`px-4 py-3 border rounded-2xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${dateFilter === 'This Month' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-[#0a0f0d] border-white/5 text-slate-300 hover:border-white/10'}`}
                    >
                        {dateFilter === 'This Month' ? 'This Month' : 'All Time'}
                        <Calendar className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveTab(category)}
                        className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${activeTab === category ? 'bg-emerald-500 text-black font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-[#131b18] border border-white/5 text-slate-400 hover:text-white hover:border-white/10'}`}
                    >
                        {category} {category === 'All Students' && `(${students.length})`}
                    </button>
                ))}
            </div>

            {/* Main Table */}
            <div className="bg-[#131b18] rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-[#0a0f0d]">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Joined</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Name</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Info</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Course</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fee to Pay</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ref. Bonus</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentStudents.length > 0 ? currentStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6 text-sm font-bold text-slate-400">
                                        {student.joiningDate ? new Date(student.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{student.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">ID: #{(student._id).slice(-4).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-xs font-bold font-mono text-slate-300">{student.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Mail className="w-3 h-3" />
                                                <span className="text-xs font-medium text-slate-500">{student.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                                            {student.course}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right sm:text-left">
                                        <div className="font-black text-white text-sm">₹{student.fee?.toLocaleString()}</div>
                                        {/* Placeholder for pending logic */}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="font-bold text-emerald-500 text-sm">
                                            {student.referralBonus > 0 ? `₹${student.referralBonus}` : '-'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedStudent(student); setFormData({ ...student }); setIsEditModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => { setSelectedStudent(student); setIsDeleteModalOpen(true); }} className="p-2 bg-rose-500/10 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            <button onClick={() => { setSelectedStudent(student); setIsViewModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-slate-500 font-bold italic">
                                        No admitted students found matching your filters...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredStudents.length > 0 && (
                    <div className="px-8 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a0f0d]">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed text-slate-700' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {pageNumbers.map(number => (
                                <button
                                    key={number}
                                    onClick={() => setCurrentPage(number)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${currentPage === number ? 'bg-emerald-500 text-black' : 'border border-white/10 text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    {number}
                                </button>
                            ))}

                            <button
                                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed text-slate-700' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}

            {/* Lead Selection Modal */}
            <Modal isOpen={isLeadSelectionModalOpen} onClose={() => setIsLeadSelectionModalOpen(false)} title="Select Lead to Admit" maxWidth="max-w-3xl">
                <div className="h-[60vh] flex flex-col">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="w-full bg-[#0a0f0d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {leads.length > 0 ? leads.map(lead => (
                            <div key={lead._id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs">
                                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                            <span className="font-bold text-emerald-500">{lead.course}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSelectLead(lead)}
                                    className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-xs font-black uppercase tracking-wide hover:bg-emerald-400 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                >
                                    Select
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-20 text-slate-500">No leads available to admit.</div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Admit Modal */}
            <Modal isOpen={isAdmitModalOpen} onClose={() => setIsAdmitModalOpen(false)} title={`Admit ${selectedLeadForAdmit?.name || 'Student'}`}>
                {selectedLeadForAdmit && (
                    <form onSubmit={handleAdmitSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fee Amount</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={admitData.fee}
                                    onChange={(e) => setAdmitData({ ...admitData, fee: e.target.value })}
                                    placeholder="Enter total course fee"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Joining Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={admitData.joiningDate}
                                    onChange={(e) => setAdmitData({ ...admitData, joiningDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Referral Bonus</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={admitData.referralBonus}
                                    onChange={(e) => setAdmitData({ ...admitData, referralBonus: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Referred By</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={admitData.referredBy}
                                    onChange={(e) => setAdmitData({ ...admitData, referredBy: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-6 gap-3">
                            <button type="button" onClick={() => setIsAdmitModalOpen(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary">Confirm Admission</button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Admitted Student">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label>
                            <input className="input-field" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Gender</label>
                            <select
                                className="input-field"
                                value={formData.gender || 'Male'}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fee</label>
                            <input type="number" className="input-field" value={formData.fee || ''} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Referral Bonus</label>
                            <input type="number" className="input-field" value={formData.referralBonus || ''} onChange={(e) => setFormData({ ...formData, referralBonus: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-6 gap-3">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Update Details</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Student Details" maxWidth="max-w-2xl">
                {selectedStudent && (
                    <div className="flex flex-col h-full bg-[#0d1210] text-[#e2e8f0]">
                        <div className="px-8 pt-8 pb-10 flex flex-col sm:flex-row items-center gap-8">
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 justify-center sm:justify-start">
                                    <h2 className="text-4xl font-black text-white tracking-tight">{selectedStudent.name}</h2>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 whitespace-nowrap uppercase tracking-widest">
                                        ● Joined - Active
                                    </span>
                                </div>
                                <p className="text-slate-400 font-bold text-lg mb-4">{selectedStudent.course} Batch 2024</p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-500 italic">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Joined {new Date(selectedStudent.joiningDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        New York, USA
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pb-8 space-y-10">
                            {/* Main Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Personal Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users className="w-4 h-4 text-emerald-500" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Information</h4>
                                    </div>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Email Address</p>
                                            <p className="text-sm font-bold text-slate-200">{selectedStudent.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Phone Number</p>
                                            <p className="text-sm font-bold text-slate-200">{selectedStudent.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Course Name</p>
                                            <p className="text-sm font-bold text-slate-200">Mastering {selectedStudent.course || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Details */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Details</h4>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 p-5 rounded-3xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] font-black text-slate-600 uppercase mb-2 text-center sm:text-left">Total Fee</p>
                                            <p className="text-2xl font-black text-white text-center sm:text-left">₹{selectedStudent.fee?.toLocaleString()}</p>
                                        </div>
                                        <div className="flex-1 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 relative group">
                                            <p className="text-[10px] font-black text-emerald-500/60 uppercase mb-2 flex items-center justify-center sm:justify-start gap-1">
                                                Fee to Pay <Activity className="w-2 h-2" />
                                            </p>
                                            <p className="text-2xl font-black text-emerald-400 text-center sm:text-left">₹{(selectedStudent.fee * 0.25).toLocaleString()} <span className="text-[10px] text-emerald-500/50">(Pending)</span></p>
                                        </div>
                                    </div>

                                    {/* Referral Info */}
                                    <div className="pt-4 mt-6 border-t border-white/5">
                                        <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Referral Info</p>
                                        <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-none mb-1">Referred By</p>
                                                    <p className="text-sm font-bold text-white">{selectedStudent.referredBy || 'Direct'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Bonus</p>
                                                <p className="text-sm font-black text-emerald-500">+₹{selectedStudent.referralBonus || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-black/20 border-t border-white/5 flex justify-end items-center gap-4 mt-auto">
                            <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors px-6 py-2 rounded-xl bg-white/5 border border-white/10">Report Issue</button>
                            <button onClick={() => setIsViewModalOpen(false)} className="px-8 py-3 bg-emerald-500 text-black rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">Close</button>
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

export default StudentsPage;
