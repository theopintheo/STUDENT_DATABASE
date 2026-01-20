const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// GET all students
router.get('/', studentController.getAllStudents);

// ADD a student
router.post('/', studentController.createStudent);

// UPDATE a student
router.put('/:id', studentController.updateStudent);

// DELETE a student
router.delete('/:id', studentController.deleteStudent);

// ADMIT a lead
router.patch('/admit/:id', studentController.admitLead);

module.exports = router;
