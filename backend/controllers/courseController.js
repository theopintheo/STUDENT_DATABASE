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
