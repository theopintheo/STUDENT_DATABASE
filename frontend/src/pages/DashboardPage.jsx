import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyRupeeIcon,
  TrendingUpIcon
} from '@heroicons/react/24/outline';
import KPICard from '../components/dashboard/KPICard';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import './DashboardPage.css';

const DashboardPage = () => {
  return(<><KPICard/><StatsCard/><RecentActivity/><h3>hello sir</h3></>)
  
  // ... rest of the component code remains the same
};
export default DashboardPage;