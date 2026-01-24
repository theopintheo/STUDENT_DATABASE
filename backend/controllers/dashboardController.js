const Student = require('../models/Student');
const Course = require('../models/Course');

exports.getStats = async (req, res) => {
    try {
        const total = await Student.countDocuments();
        const leadCount = await Student.countDocuments({ isAdmitted: false });
        const admittedCount = await Student.countDocuments({ isAdmitted: true });
        const interestedCount = await Student.countDocuments({ reply: 'Interested' });
        const pendingRemindersCount = await Student.countDocuments({ remind: true });

        // Detailed Status Breakdown
        const statusBreakdown = await Student.aggregate([
            { $match: { isAdmitted: false } },
            { $group: { _id: '$reply', count: { $sum: 1 } } }
        ]);

        // Financial stats
        const financialStats = await Student.aggregate([
            {
                $group: {
                    _id: null,
                    totalPotentialRevenue: { $sum: '$fee' },
                    collectedRevenue: {
                        $sum: { $cond: [{ $eq: ['$isAdmitted', true] }, '$fee', 0] }
                    },
                    totalReferrals: {
                        $sum: { $cond: [{ $eq: ['$isAdmitted', true] }, '$referralBonus', 0] }
                    }
                }
            }
        ]);

        const revenue = financialStats.length > 0 ? financialStats[0].collectedRevenue : 0;
        const potentialRevenue = financialStats.length > 0 ? financialStats[0].totalPotentialRevenue : 0;
        const referrals = financialStats.length > 0 ? financialStats[0].totalReferrals : 0;

        const successRate = total > 0 ? ((admittedCount / total) * 100).toFixed(1) : 0;

        // Fetch recent activity
        const recentActivity = await Student.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name course reply isAdmitted createdAt fee phone email additionalInfo');

        // Fetch upcoming reminders
        const upcomingReminders = await Student.find({ remind: true, reminderDate: { $gte: new Date() } })
            .sort({ reminderDate: 1 })
            .limit(5)
            .select('name reminderDate course');

        // Course distribution data
        const courseDistribution = await Student.aggregate([
            { $group: { _id: '$course', count: { $sum: 1 } } }
        ]);

        const allCoursesList = await Course.find({}, 'name');

        const distributionMap = {};
        courseDistribution.forEach(item => {
            if (item._id) distributionMap[item._id] = item.count;
        });

        const studentData = allCoursesList.map(course => ({
            name: course.name,
            count: distributionMap[course.name] || 0
        }));

        // Sort by count descending
        studentData.sort((a, b) => b.count - a.count);

        // Enrollment Trends (Weekly)
        const sixWeeksAgo = new Date();
        sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

        const trends = await Student.aggregate([
            { $match: { createdAt: { $gte: sixWeeksAgo } } },
            {
                $group: {
                    _id: { $week: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const engagementData = trends.map((t, idx) => ({
            name: `Week ${idx + 1}`,
            value: t.count
        }));

        // Fill in mock data if trends are empty for better visual
        const finalEngagement = engagementData.length > 0 ? engagementData : [
            { name: 'Week 1', value: 0 },
            { name: 'Week 2', value: 0 },
            { name: 'Week 3', value: 0 },
            { name: 'Week 4', value: 0 },
            { name: 'Week 5', value: 0 },
        ];

        res.json({
            totalStudents: total,
            leadCount,
            admittedCount,
            interestedCount,
            pendingReminders: pendingRemindersCount,
            successRate,
            revenue,
            potentialRevenue,
            referrals,
            statusBreakdown,
            recentActivity,
            upcomingReminders,
            studentData,
            engagementData: finalEngagement,
            allCourses: allCoursesList.map(c => c.name)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



