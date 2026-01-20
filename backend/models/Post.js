const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    details: { type: String, required: true },
    media: { type: String }, // URL to image/video
    type: { type: String, enum: ['image', 'video', 'text'], default: 'text' }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
