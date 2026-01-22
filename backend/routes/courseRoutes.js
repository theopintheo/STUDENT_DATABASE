const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// GET all courses
router.get('/', courseController.getAllCourses);

// GET single course by code
router.get('/:code', courseController.getCourseByCode);

// UPDATE course
router.put('/:id', courseController.updateCourse);

module.exports = router;
