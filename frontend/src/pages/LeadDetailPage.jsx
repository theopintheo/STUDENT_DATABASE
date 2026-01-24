import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, MapPin, Mail, Phone, GraduationCap,
    Banknote, Sparkles, Activity, DollarSign, Users, Check, Edit2
} from 'lucide-react';
import { studentAPI, courseAPI } from '../api';
import Modal from '../components/Modal';

const LeadDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);

    // Form states
    const [formData, setFormData] = useState({});
    const [admitData, setAdmitData] = useState({
        joiningDate: new Date().toISOString().split('T')[0],
        fee: '',
        referralBonus: '0',
        referredBy: ''
    });

    useEffect(() => {
        fetchLeadDetails();
        fetchCourses();
    }, [id]);

    const fetchCourses = async () => {
        try {
            const response = await courseAPI.getAll();
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };

    const fetchLeadDetails = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getById(id);
            setLead(response.data);
            setFormData(response.data); // Initialize edit form
        } catch (err) {
            console.error("Error fetching lead details:", err);
            setError("Failed to load lead details.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await studentAPI.update(id, formData);
            await fetchLeadDetails();
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Error updating lead:", err);
        }
    };

    const handleAdmit = () => {
        const matchedCourse = courses.find(c => c.name === lead.course || c.courseCode === lead.course);
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
            await studentAPI.admit(id, admitData);
            navigate('/students'); // After admit, go to students list
        } catch (err) {
            console.error("Error admitting student:", err);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteConfirm = async () => {
        try {
            await studentAPI.delete(id);
            navigate('/leads');
        } catch (err) {
            console.error("Error deleting lead:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !lead) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <p className="text-slate-400 font-bold">{error || "Lead not found."}</p>
                <button
                    onClick={() => navigate('/leads')}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                >
                    Back to Leads
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in pb-10">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/leads')}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight uppercase">{lead.name}</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Lead Details Viewer</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Info Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-8 flex flex-col items-center text-center space-y-6">
                        <div className="space-y-2 w-full">
                            <span className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/20 inline-flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {lead.reply || 'Interested'}
                            </span>
                            <h2 className="text-3xl font-black text-white">{lead.name}</h2>
                            <p className="text-slate-500 font-bold">{lead.course}</p>
                        </div>

                        <div className="w-full pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Inquired On</span>
                                <span className="text-white font-bold">{new Date(lead.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Lead ID</span>
                                <span className="text-white font-bold">#{(lead._id).slice(-6).toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button onClick={handleAdmit} className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> Join Student
                            </button>
                            <button onClick={() => setIsEditModalOpen(true)} className="w-full py-4 bg-white/5 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2">
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </button>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="w-full py-3 bg-rose-500/10 text-rose-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 flex items-center justify-center gap-2">
                                Delete Lead
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Information Sections */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Info */}
                    <div className="glass-card p-8 space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Users className="w-5 h-5 text-emerald-500" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Contact Information</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <p className="text-lg font-bold text-slate-300 italic">{lead.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Phone Number
                                </label>
                                <p className="text-lg font-bold text-slate-300 italic font-mono tracking-tight">{lead.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <GraduationCap className="w-3 h-3" /> Interested Course
                                </label>
                                <p className="text-lg font-bold text-emerald-500">{lead.course}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Engagement Status
                                </label>
                                <p className="text-lg font-bold text-slate-300">{lead.reply}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="glass-card p-8 space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Additional Information</h4>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/2 border border-white/5">
                            <p className="text-slate-400 leading-relaxed italic">
                                {lead.additionalInfo || "No additional notes or comments recorded for this lead yet."}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div onClick={handleAdmit} className="glass-card p-6 flex items-center gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-white font-black text-sm uppercase">Convert to Student</h5>
                                <p className="text-slate-500 text-xs font-bold">Process admission and fees</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 flex items-center gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-white font-black text-sm uppercase">Schedule Follow-up</h5>
                                <p className="text-slate-500 text-xs font-bold">Set reminders for this lead</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Lead Details">
                <form onSubmit={handleEditSave} className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Status</label>
                            <select
                                className="input-field"
                                value={formData.reply || 'Interested'}
                                onChange={(e) => setFormData({ ...formData, reply: e.target.value })}
                            >
                                <option value="Interested">Interested</option>
                                <option value="Follow-up">Follow-up</option>
                                <option value="Not Interested">Not Interested</option>
                                <option value="Busy">Busy</option>
                            </select>
                        </div>
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
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Update Lead</button>
                    </div>
                </form>
            </Modal>

            {/* Admit Modal */}
            <Modal isOpen={isAdmitModalOpen} onClose={() => setIsAdmitModalOpen(false)} title="Convert Lead to Student" maxWidth="max-w-2xl">
                <form onSubmit={confirmAdmit} className="space-y-10 pb-4">
                    <div className="p-5 rounded-3xl bg-white/2 border border-white/5">
                        <div>
                            <h4 className="text-xl font-black text-white">{lead.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead #{(lead._id || '0000').slice(-4)}</span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-tighter">Ready to Join</span>
                            </div>
                        </div>
                    </div>

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
                                    value={admitData.course || lead.course || ''}
                                    onChange={(e) => setAdmitData({ ...admitData, course: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a specialized track</option>
                                    {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Start Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={admitData.joiningDate}
                                    onChange={(e) => setAdmitData({ ...admitData, joiningDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                            <Banknote className="w-5 h-5 text-emerald-500" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Payment & Fees</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Agreed Total Fee</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={admitData.fee}
                                    onChange={(e) => setAdmitData({ ...admitData, fee: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Upfront Payment</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={() => setIsAdmitModalOpen(false)} className="px-8 py-3 rounded-2xl border border-white/10 text-slate-400 font-black text-sm hover:bg-white/5 transition-all">Cancel</button>
                        <button type="submit" className="px-10 py-3 bg-emerald-500 text-black rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center gap-2">
                            Go Live
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
                <div className="space-y-6">
                    <p className="text-slate-400 leading-relaxed font-bold italic">
                        Are you sure you want to delete <span className="text-white not-italic">{lead.name}</span>? This action is permanent and will remove all associated data.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-all border border-white/10">Cancel</button>
                        <button onClick={handleDeleteConfirm} className="px-6 py-2 bg-rose-500 text-white rounded-xl font-black hover:bg-rose-600 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)]">Delete Permanent</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LeadDetailPage;
