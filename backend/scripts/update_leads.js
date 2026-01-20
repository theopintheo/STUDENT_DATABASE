const mongoose = require('mongoose');
const Student = require('../models/Student');

const MONGO_URI = 'mongodb+srv://student_db_minipro:rtr2025@studentdatabase.wjsixmy.mongodb.net/educational_db?retryWrites=true&w=majority';

const updateCourseNames = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to educational_db...');

        // Map old names or variations to new standardized names
        const updates = [
            { old: 'Full Stack Development', new: 'Full Stack Web Development' },
            { old: 'Data Science', new: 'Data Science with Python' },
            { old: 'Digital Marketing', new: 'Mobile App Development' } // Mapping for demo purposes if needed
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
