import React, { useState, useEffect } from 'react';

function DataDisplay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ✅ Step 1: Get response object (not the data yet)
        const response = await fetch('/api/user');
        
        // ✅ Step 2: Check if response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // ✅ Step 3: Parse JSON from response
        const jsonData = await response.json();
        
        // ✅ Step 4: Set state with actual data
        setData(jsonData);
        setError(null);
      } catch (err) {
        // ✅ Handle errors
        setError(err.message);
        console.error('Fetch error:', err);
        
        // Debug: what are we actually getting?
        console.log('Error object:', err);
        console.log('Error type:', typeof err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debug: check what's in data
  console.log('Data in state:', data);
  console.log('Data type:', typeof data);
  console.log('Is XMLHttpRequest?', data instanceof XMLHttpRequest);

  // ✅ Safe rendering
  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    
    if (error) return <div>Error: {error}</div>;
    
    if (!data) return <div>No data available</div>;
    
    // ✅ Check if data is an XMLHttpRequest (shouldn't happen)
    if (data instanceof XMLHttpRequest || 
        (data.readyState !== undefined && data.response !== undefined)) {
      console.error('ERROR: Got XMLHttpRequest in data!');
      return <div>Error: Received request object instead of data</div>;
    }
    
    // ✅ Normal rendering for actual data
    return (
      <div>
        <h3>User Data:</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="data-display">
      <h2>Data Display Component</h2>
      {renderContent()}
    </div>
  );
}

export default DataDisplay;