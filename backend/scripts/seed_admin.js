const mongoose = require('mongoose');
const User = require('../models/User');
const Counter = require('../models/Counter');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') }); // Adjust path to root .env if it's there, or just .env if in backend

// Fallback to the URI we saw earlier if .env fails or is missing
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://student_db_minipro:rtr2025@studentdatabase.wjsixmy.mongodb.net/educational_db?retryWrites=true&w=majority';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing users for a clean start with new schema
        await User.deleteMany({});
        console.log('Cleared existing users');

        const admin = new User({
            username: 'admin',
            email: 'admin@cisl.com',
            password: 'password123',
            role: 'admin',
            profile: {
                firstName: 'System',
                lastName: 'Administrator',
            },
            permissions: [
                { module: 'dashboard', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'leads', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'students', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'courses', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'enrollments', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'payments', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'attendance', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'content', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'users', canView: true, canCreate: true, canEdit: true, canDelete: true },
                { module: 'reports', canView: true, canCreate: true, canEdit: true, canDelete: true }
            ]
        });

        await admin.save();
        console.log('Admin user seeded: admin / password123');

        mongoose.connection.close();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedAdmin();
