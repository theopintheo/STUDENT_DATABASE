// src/services/analyticsService.js

// IMPORTANT: This function should return JUST the data, not {success, data}
// OR you need to handle the response properly in your component

export const getDashboardStats = async () => {
  // Return mock dashboard stats (no async operations that can throw here)
  return {
    success: true,
    data: {
      totalStudents: 245,
      totalCourses: 18,
      totalRevenue: 125000,
      pendingPayments: 8
    }
  };
};

export const getChartData = async () => {
  // Return mock chart data (synchronous mock, no errors expected)
  return {
    success: true,
    data: {
      enrollmentData: [
        { month: 'Jan', enrollments: 45 },
        { month: 'Feb', enrollments: 52 },
        { month: 'Mar', enrollments: 48 },
        { month: 'Apr', enrollments: 65 },
        { month: 'May', enrollments: 58 },
        { month: 'Jun', enrollments: 72 }
      ],
      revenueData: [
        { name: 'Course Fees', value: 85000 },
        { name: 'Study Material', value: 25000 },
        { name: 'Certification', value: 15000 }
      ]
    }
  };
};