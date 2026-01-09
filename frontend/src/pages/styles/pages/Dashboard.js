import React from 'react';
import DataDisplay from '../components/DataDisplay';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <DataDisplay />  // ❌ Error propagates from here
    </div>
  );
}

export default Dashboard;