// src/services/analyticsService.js

// IMPORTANT: This function should return JUST the data, not {success, data}
// OR you need to handle the response properly in your component

export const getDashboardStats = async () => {
  try {
    // If you're calling a real API, it might return {success, data}
    // const response = await fetch('/api/dashboard/stats');
    // return await response.json(); // This might return {success: true, data: {...}}
    
    // For mock data, return JUST the data object
    return {
      success: true,
      data: {  // This is what we extract in the component
        totalStudents: 245,
        totalCourses: 18,
        totalRevenue: 125000,
        pendingPayments: 8
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      data: {
        totalStudents: 0,
        totalCourses: 0,
        totalRevenue: 0,
        pendingPayments: 0
      }
    };
  }
};

export const getChartData = async () => {
  try {
    // Return mock data with the same structure
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
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return {
      success: false,
      data: {
        enrollmentData: [],
        revenueData: []
      }
    };
  }
};