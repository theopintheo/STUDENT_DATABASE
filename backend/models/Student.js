const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    course: { type: String, required: true },
    reply: { type: String, enum: ['Interested', 'Not Interested', 'Reminder', 'Follow-up', 'Enrolled'], default: 'Interested' },
    additionalInfo: { type: String },
    reminderDate: { type: Date },
    remind: { type: Boolean, default: false },
    isAdmitted: { type: Boolean, default: false },
    joiningDate: { type: Date },
    fee: { type: Number },
    referralBonus: { type: Number },
    referredBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
