import React, { useState, useEffect } from 'react';
import { Search, Book, Edit2, DollarSign, Clock, Users, Save, X, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { courseAPI } from '../api';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [editForm, setEditForm] = useState({ description: '', totalFee: '' });
    const [addForm, setAddForm] = useState({
        name: '',
        courseCode: '',
        description: '',
        totalFee: '',
        durationValue: '',
        durationUnit: 'months'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseAPI.getAll();
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (course) => {
        setSelectedCourse(course);
        setEditForm({
            description: course.description || '',
            totalFee: course.fees?.total || ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await courseAPI.update(selectedCourse._id, {
                description: editForm.description,
                totalFee: editForm.totalFee
            });
            fetchCourses();
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Error updating course:", err);
            alert("Failed to update course");
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            await courseAPI.create({
                name: addForm.name,
                courseCode: addForm.courseCode,
                description: addForm.description,
                fees: { total: parseFloat(addForm.totalFee) },
                duration: {
                    value: parseInt(addForm.durationValue),
                    unit: addForm.durationUnit
                }
            });
            fetchCourses();
            setIsAddModalOpen(false);
            setAddForm({
                name: '',
                courseCode: '',
                description: '',
                totalFee: '',
                durationValue: '',
                durationUnit: 'months'
            });
        } catch (err) {
            console.error("Error adding course:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to add course";
            alert(`Failed to add course: ${errorMessage}`);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Course Management</h1>
                    <p className="text-slate-500 mt-2 font-medium max-w-2xl">Manage course details, descriptions, and fee structures.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="bg-[#131b18] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-3 bg-emerald-500 text-black rounded-xl font-black text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Add Course
                    </button>
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                    <div key={course._id} className="glass-card group hover:border-emerald-500/30 transition-all duration-300">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                    <Book className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={() => handleEditClick(course)}
                                    className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{course.courseCode}</p>
                            </div>

                            <p className="text-slate-400 text-sm line-clamp-3 h-[60px]">
                                {course.description || "No description available."}
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Fee</p>
                                    <p className="text-emerald-500 font-bold flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {course.fees?.total?.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Duration</p>
                                    <p className="text-white font-bold flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-500" />
                                        {course.duration?.value} {course.duration?.unit}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${selectedCourse?.name}`}>
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                        <textarea
                            className="w-full bg-[#0a0f0d] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 min-h-[120px]"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Enter course description..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Total Fee (₹)</label>
                        <input
                            type="number"
                            className="input-field"
                            value={editForm.totalFee}
                            onChange={(e) => setEditForm({ ...editForm, totalFee: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Course Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Course">
                <form onSubmit={handleAddCourse} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Course Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={addForm.name}
                                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                placeholder="e.g., Full Stack Development"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Course Code</label>
                            <input
                                type="text"
                                className="input-field"
                                value={addForm.courseCode}
                                onChange={(e) => setAddForm({ ...addForm, courseCode: e.target.value })}
                                placeholder="e.g., FSD-101"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                        <textarea
                            className="w-full bg-[#0a0f0d] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 min-h-[120px]"
                            value={addForm.description}
                            onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                            placeholder="Enter course description..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Total Fee (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={addForm.totalFee}
                                onChange={(e) => setAddForm({ ...addForm, totalFee: e.target.value })}
                                placeholder="e.g., 50000"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Duration</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    className="input-field flex-1"
                                    value={addForm.durationValue}
                                    onChange={(e) => setAddForm({ ...addForm, durationValue: e.target.value })}
                                    placeholder="6"
                                    required
                                />
                                <select
                                    className="input-field"
                                    value={addForm.durationUnit}
                                    onChange={(e) => setAddForm({ ...addForm, durationUnit: e.target.value })}
                                >
                                    <option value="months">Months</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">
                            <Plus className="w-4 h-4" />
                            Add Course
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CoursesPage;
