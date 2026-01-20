import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Calendar, DollarSign, Award, ThumbsUp, CheckCircle2, MapPin, Activity, Users } from 'lucide-react';
import Modal from '../components/Modal';
import { studentAPI } from '../api';


const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Edit State
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getAll();
            // Filter only admitted students
            setStudents(response.data.filter(s => s.isAdmitted));
        } catch (err) {
            console.error("Error fetching admitted students:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await studentAPI.update(selectedStudent._id, formData);
            fetchStudents();
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Error updating student:", err);
        }
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
        student.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    return (
        <div className="space-y-8 fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admitted Students</h1>
                    <p className="text-slate-500 mt-1">Manage enrolled students, fees, and referral records.</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="input-field pl-10 w-64 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden scale-in">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[900px]">
                        <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-6 py-5">Joining Date</th>
                                <th className="px-6 py-5">Student</th>
                                <th className="px-6 py-5">Course</th>
                                {isAdmin && <th className="px-6 py-5">Fee</th>}
                                {isAdmin && <th className="px-6 py-5">Referral Details</th>}
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.map((student) => (
                                <tr key={student._id} className="table-row-hover group">
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {student.joiningDate ? new Date(student.joiningDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{student.name}</div>
                                        <div className="text-xs text-slate-400">{student.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">{student.course}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-indigo-600">₹{student.fee?.toLocaleString()}</span>
                                        </td>
                                    )}
                                    {isAdmin && (
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-slate-900">By: {student.referredBy || 'Direct'}</div>
                                            <div className="text-[10px] text-emerald-600 font-black uppercase">Bonus: ₹{student.referralBonus || 0}</div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedStudent(student); setFormData({ ...student }); setIsEditModalOpen(true); }} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => { setSelectedStudent(student); setIsDeleteModalOpen(true); }} className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                            <button onClick={() => { setSelectedStudent(student); setIsViewModalOpen(true); }} className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Admitted Student">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label>
                            <input className="input-field" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
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
                        {/* Profile Header */}
                        <div className="px-8 pt-8 pb-10 flex flex-col sm:flex-row items-center gap-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 p-1 bg-emerald-500/10 overflow-hidden">
                                    <div className="w-full h-full rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-4xl font-black">
                                        {selectedStudent.name.charAt(0)}
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-emerald-500 text-black p-1.5 rounded-full ring-4 ring-[#0d1210]">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            </div>

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
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden">
                                                    {selectedStudent.referredBy ? selectedStudent.referredBy.charAt(0) : 'D'}
                                                </div>
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

        </div>
    );
};

export default StudentsPage;
