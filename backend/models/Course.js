const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: 'technology' },
    description: { type: String },
    shortDescription: { type: String },
    duration: {
        value: { type: Number },
        unit: { type: String, default: 'months' }
    },
    fees: {
        total: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        installments: { type: Boolean, default: false }
    },
    curriculum: [{ type: String }],
    prerequisites: [{ type: String }],
    learningOutcomes: [{ type: String }],
    targetAudience: [{ type: String }],
    instructors: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    enrollmentStats: {
        totalEnrolled: { type: Number, default: 0 },
        activeStudents: { type: Number, default: 0 }
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    batches: [{
        startDate: { type: Date },
        timings: { type: String },
        status: { type: String }
    }],
    meta: {
        headline: { type: String },
        keywords: [{ type: String }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
