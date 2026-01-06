// src/components/common/Charts/index.jsx
import React from 'react';

export const BarChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-10">No data available</div>;
  }
  
  const maxValue = Math.max(...data.map(item => item.value || 0));
  
  return (
    <div className="h-full flex items-end space-x-2 p-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-blue-500 rounded-t"
            style={{
              height: `${((item.value || 0) / maxValue) * 100}%`,
              minHeight: '20px'
            }}
          ></div>
          <div className="text-xs mt-2 text-gray-600">{item.name || item.month}</div>
        </div>
      ))}
    </div>
  );
};

export const LineChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-10">No data available</div>;
  }
  
  return (
    <div className="h-full p-4">
      <div className="relative h-full">
        {data.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span className="text-sm">{item.month}</span>
              <span className="text-sm font-semibold">{item.enrollments || 0}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div 
                className="bg-green-500 h-2 rounded"
                style={{ width: `${(item.enrollments || 0) * 5}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PieChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-10">No data available</div>;
  }
  
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="h-full flex flex-col justify-center p-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center mb-3">
          <div 
            className="w-4 h-4 rounded mr-2"
            style={{ backgroundColor: colors[index % colors.length] }}
          ></div>
          <div className="flex-1">
            <span className="text-sm">{item.name}</span>
          </div>
          <span className="text-sm font-semibold">₹{item.value}</span>
        </div>
      ))}
    </div>
  );
};