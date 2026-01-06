import React from 'react';
import CustomLineChart from '../common/Charts/LineChart';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  chartData,
  chartColor = '#3b82f6',
  showChart = true 
}) => {
  const chartLines = [
    {
      dataKey: 'value',
      name: title,
      color: chartColor,
    },
  ];

  const formattedChartData = chartData?.map((val, index) => ({
    name: `Day ${index + 1}`,
    value: val,
  })) || [];

  return (
    <div className="stats-card">
      <div className="stats-header">
        <h4 className="stats-title">{title}</h4>
        <h3>hello reman</h3>
      </div>
  
      
      <div className="stats-content">
        <div className="stats-values">
          <h3 className="stats-main-value">{value}</h3>
          {subtitle && (
            <p className="stats-subtitle">{subtitle}</p>
          )}
        </div>
        
        {showChart && chartData && (
          <div className="stats-chart">
            <CustomLineChart
              data={formattedChartData}
              lines={chartLines}
              height={80}
              showGrid={false}
              showTooltip={false}
              showLegend={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;