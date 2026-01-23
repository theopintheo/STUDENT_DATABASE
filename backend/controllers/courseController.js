const Course = require('../models/Course');

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'active' });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCourseByCode = async (req, res) => {
    try {
        const course = await Course.findOne({ courseCode: req.params.code });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { description, totalFee } = req.body;
        const updateData = {};
        if (description) updateData.description = description;
        if (totalFee) updateData['fees.total'] = totalFee;

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { name, courseCode, description, fees, duration } = req.body;

        // Check if course code already exists
        const existingCourse = await Course.findOne({ courseCode });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        const course = new Course({
            name,
            courseCode,
            description,
            fees,
            duration,
            status: 'active'
        });

        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
