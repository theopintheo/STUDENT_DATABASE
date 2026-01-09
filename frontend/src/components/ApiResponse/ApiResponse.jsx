// src/components/ApiResponse/ApiResponse.jsx
import React, { useState, useEffect } from 'react';
import DebugView from '../DebugView';

const ApiResponse = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        setResponse(data); // data = { success: true, data: {...} }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* Option 1: Show everything for debugging */}
      <DebugView data={response} title="API Response" />
      
      {/* Option 2: Show just the data part */}
      {response && (
        <div>
          <h2>User Info</h2>
          <p>Status: {response.success ? '✅ Success' : '❌ Failed'}</p>
          <pre>{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      )}
      
      {/* Option 3: Extract and display specific fields */}
      {response && response.success && (
        <div>
          <h3>Welcome {response.data.name}!</h3>
          <p>Email: {response.data.email}</p>
          <p>ID: {response.data.id}</p>
        </div>
      )}
    </div>
  );
};

export default ApiResponse;