const mongoose = require('mongoose');
const Course = require('../models/Course');

const MONGO_URI = 'mongodb+srv://student_db_minipro:rtr2025@studentdatabase.wjsixmy.mongodb.net/educational_db?retryWrites=true&w=majority';

const courseData = [
    {
        courseCode: 'FSWD001',
        name: 'Full Stack Web Development',
        category: 'technology',
        description: 'Complete web development course covering frontend and backend technology.',
        shortDescription: 'Become a full stack web developer in 6 months',
        duration: { value: 6, unit: 'months' },
        fees: { total: 45000, currency: 'INR', installments: true },
        curriculum: ['HTML/CSS/JS', 'Node.js & MongoDB', 'React', 'Deployment'],
        status: 'active'
    },
    {
        courseCode: 'DSF002',
        name: 'Data Science with Python',
        category: 'technology',
        description: 'Comprehensive data science course covering Python, statistics, machine learning.',
        shortDescription: 'Master data science concepts and tools',
        duration: { value: 6, unit: 'months' },
        fees: { total: 55000, currency: 'INR', installments: true },
        curriculum: ['Python for Data Science', 'Statistics', 'Machine Learning', 'Data Visualization'],
        status: 'active'
    },
    {
        courseCode: 'MOB003',
        name: 'Mobile App Development',
        category: 'technology',
        description: 'Learn to build native and cross-platform mobile applications for iOS and Android.',
        shortDescription: 'Build mobile apps for iOS and Android',
        duration: { value: 6, unit: 'months' },
        fees: { total: 50000, currency: 'INR', installments: true },
        curriculum: ['React Native', 'Flutter', 'State Management', 'App Store Deployment'],
        status: 'active'
    }
];

const seedCourses = async () => {
    try {
        console.log('Connecting to educational_db for course seeding...');
        await mongoose.connect(MONGO_URI);

        await Course.deleteMany({});
        console.log('Cleared existing courses');

        await Course.insertMany(courseData);
        console.log('Successfully seeded default courses!');

        process.exit(0);
    } catch (err) {
        console.error('Course Seeding Failed:', err);
        process.exit(1);
    }
};

seedCourses();
