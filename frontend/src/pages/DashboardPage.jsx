import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, PieChart } from '../components/common/Charts';
import { getDashboardStats, getChartData } from '../services/analyticsService';
import {
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import './DashboardPage.css';

const DashboardPage = () => {
  // Fetch dashboard statistics
  const { 
    data: statsResponse, 
    isLoading: statsLoading, 
    error: statsError,
    isError: statsIsError
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => getDashboardStats(),
  });

  // Fetch chart data
  const { 
    data: chartsResponse, 
    isLoading: chartsLoading,
    isError: chartsIsError
  } = useQuery({
    queryKey: ['chartData'],
    queryFn: () => getChartData(),
  });

  // Extract JUST the data from responses, not the entire response object
  // The error is because you're trying to render {success: true, data: {...}}
  // You need to extract just the .data part
  const stats = React.useMemo(() => {
    // Check if response exists and has data property
    if (statsResponse && statsResponse.data) {
      return statsResponse.data; // Extract just the data
    }
    return {
      totalStudents: 0,
      totalCourses: 0,
      totalRevenue: 0,
      pendingPayments: 0
    };
  }, [statsResponse]);

  const chartData = React.useMemo(() => {
    // Check if response exists and has data property
    if (chartsResponse && chartsResponse.data) {
      return chartsResponse.data; // Extract just the data
    }
    return {
      enrollmentData: [],
      revenueData: []
    };
  }, [chartsResponse]);

  // Handle loading state
  if (statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (statsIsError || statsError) {
    console.error('Dashboard error:', statsError);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold text-lg mb-2">⚠️ Connection Issue</h3>
          <p className="text-red-600 mb-4">Unable to connect to the server.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-gradient px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Stats data - Now using the extracted 'stats' object, not 'statsResponse'
  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents || 0, // Directly use stats property
      icon: <UsersIcon style={{height:"15px",width:"10px"}} />,
      color: 'blue',
      change: '+12%',
      description: 'From last month'
    },
    {
      title: 'Active Courses',
      value: stats.totalCourses || 0, // Directly use stats property
      icon: <BookOpenIcon style={{height:"15px",width:"10px"}} />,
      color: 'green',
      change: '+5%',
      description: 'From last month'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, // Directly use stats property
      icon: <CurrencyRupeeIcon style={{height:"15px",width:"10px"}} />,
      color: 'yellow',
      change: '+18%',
      description: 'From last month'
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments || 0, // Directly use stats property
      icon: <ClockIcon style={{height:"15px",width:"10px"}} />,
      color: 'red',
      change: '-3%',
      description: 'From last month'
    }
  ];

  // Mock data for recent activities
  const recentActivities = [
    { id: 1, student: 'John Doe', action: 'Enrolled in React Course', time: '10 min ago' },
    { id: 2, student: 'Jane Smith', action: 'Completed payment', time: '25 min ago' },
    { id: 3, student: 'Bob Johnson', action: 'Updated profile', time: '1 hour ago' },
    { id: 4, student: 'Alice Brown', action: 'Started new course', time: '2 hours ago' },
    { id: 5, student: 'Charlie Wilson', action: 'Submitted assignment', time: '3 hours ago' }
  ];

  return (
    <div className="dashboard-container p-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 gradient-text">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your academy today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="btn-gradient px-4 py-2 rounded-lg"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card hover-lift p-6 rounded-xl bg-white shadow-sm border border-gray-200"
            style={{ 
              '--card-color': stat.color === 'blue' ? '#3b82f6' : 
                             stat.color === 'green' ? '#10b981' : 
                             stat.color === 'yellow' ? '#f59e0b' : '#ef4444'
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">
                  {/* This is safe - rendering a number/string, not an object */}
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon style={{height:"15px",width:"10px"}} />
                  <span className="metric-badge positive">{stat.change}</span>
                  <span className="text-gray-500 text-sm ml-2">{stat.description}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-50' : 
                stat.color === 'green' ? 'bg-green-50' : 
                stat.color === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment Chart */}
        <div className="chart-container p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Enrollment Trends</h2>
            <ChartBarIcon style={{height:"15px",width:"10px"}}/>
          </div>
          {chartsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="loading-spinner"></div>
            </div>
          ) : chartsIsError ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Chart data unavailable</p>
            </div>
          ) : (
            <div className="h-64">
              {/* Pass just the array, not the entire object */}
              <LineChart data={chartData.enrollmentData || []} />
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="chart-container p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h2>
            <ChartPieIcon style={{height:"15px",width:"10px"}} />
          </div>
          {chartsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="loading-spinner"></div>
            </div>
          ) : chartsIsError ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Chart data unavailable</p>
            </div>
          ) : (
            <div className="h-64">
              {/* Pass just the array, not the entire object */}
              <PieChart data={chartData.revenueData || []} />
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="activity-item flex items-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UsersIcon className=''/>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">{activity.student}</p>
                <p className="text-gray-600 text-sm">{activity.action}</p>
              </div>
              <div className="text-gray-500 text-sm">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;