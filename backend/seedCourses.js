const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Course = require('./models/Course');

dotenv.config();
connectDB();

const courses = [
    {
        name: 'Fullstack AI & ML',
        courseCode: 'FSD-AI-ML',
        description: 'Comprehensive program covering Full Stack Development integrated with AI and Machine Learning modules.',
        fees: { total: 75000 },
        duration: { value: 8, unit: 'months' }
    },
    {
        name: 'DevOps Engineering',
        courseCode: 'DEVOPS-001',
        description: 'Master CI/CD pipelines, containerization with Docker & Kubernetes, and cloud infrastructure.',
        fees: { total: 55000 },
        duration: { value: 4, unit: 'months' }
    },
    {
        name: 'Cyber Security',
        courseCode: 'CYBER-SEC',
        description: 'Learn ethical hacking, network security, and cryptography to secure digital assets.',
        fees: { total: 65000 },
        duration: { value: 6, unit: 'months' }
    },
    {
        name: 'Python Summer Coding',
        courseCode: 'PY-SUMMER',
        description: 'Intensive summer boot camp for Python programming fundamentals and project building.',
        fees: { total: 15000 },
        duration: { value: 2, unit: 'months' }
    },
    {
        name: 'Data Science',
        courseCode: 'DS-PRO',
        description: 'Advanced data analysis, visualization, and predictive modeling using Python and R.',
        fees: { total: 70000 },
        duration: { value: 6, unit: 'months' }
    },
    {
        name: 'Digital Marketing',
        courseCode: 'DIG-MKT',
        description: 'Master SEO, SEM, content marketing, and social media strategies to grow businesses online.',
        fees: { total: 45000 },
        duration: { value: 3, unit: 'months' }
    }
];

const seedCourses = async () => {
    try {
        console.log('Clearing existing courses...');
        // Optional: clear existing if you want to rely on unique index or just error out on duplicates
        // await Course.deleteMany({}); 

        for (const courseData of courses) {
            const exists = await Course.findOne({ courseCode: courseData.courseCode });
            if (!exists) {
                await Course.create(courseData);
                console.log(`Created: ${courseData.name}`);
            } else {
                console.log(`Skipped (Exists): ${courseData.name}`);
            }
        }

        console.log('Seeding complete!');
        process.exit();
    } catch (err) {
        console.error('Error seeding courses:', err);
        process.exit(1);
    }
};

seedCourses();
