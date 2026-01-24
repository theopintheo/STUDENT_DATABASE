const mongoose = require('mongoose');
const Student = require('../models/Student');

const MONGO_URI = 'mongodb+srv://student_db_minipro:rtr2025@studentdatabase.wjsixmy.mongodb.net/educational_db?retryWrites=true&w=majority';

const updateCourseNames = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to educational_db...');

        // Map old names or variations to new standardized names
        const updates = [
            { old: 'Full Stack Development', new: 'Fullstack AI & ML' },
            { old: 'Full Stack Dev', new: 'DevOps Engineering' }
        ];

        for (const mapping of updates) {
            const result = await Student.updateMany(
                { course: mapping.old },
                { course: mapping.new }
            );
            console.log(`Updated ${result.modifiedCount} records from "${mapping.old}" to "${mapping.new}"`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Update Failed:', err);
        process.exit(1);
    }
};

updateCourseNames();
