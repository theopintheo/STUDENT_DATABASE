// src/components/DebugView/DebugView.jsx
import React from 'react';

const DebugView = ({ data, title = "Debug Data" }) => {
  return (
    <div className="debug-view">
      <h3>{title}</h3>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        overflow: 'auto',
        fontSize: '14px'
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default DebugView;