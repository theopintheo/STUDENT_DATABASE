const mongoose = require('mongoose');
const Student = require('./backend/models/Student');

async function checkData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/student_database');
        const count = await Student.countDocuments();
        const admitted = await Student.countDocuments({ isAdmitted: true });
        const leads = await Student.countDocuments({ isAdmitted: false });
        const courses = await Student.distinct('course');
        const replies = await Student.aggregate([
            { $group: { _id: '$reply', count: { $sum: 1 } } }
        ]);
        const totalFee = await Student.aggregate([
            { $group: { _id: null, total: { $sum: '$fee' } } }
        ]);

        console.log('--- Data Summary ---');
        console.log(`Total Records: ${count}`);
        console.log(`- Admitted Content: ${admitted}`);
        console.log(`- Leads (Not Admitted): ${leads}`);
        console.log(`\nCourses/Facilities Detected: ${courses.join(', ')}`);
        console.log('\nStatus Breakdown:');
        replies.forEach(r => console.log(`- ${r._id}: ${r.count}`));
        console.log(`\nTotal Expected Revenue: ₹${totalFee[0]?.total || 0}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
