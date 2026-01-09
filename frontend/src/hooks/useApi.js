// src/hooks/useApi.js
import { useState, useEffect } from 'react';

function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(response => {
        console.log('API Response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.error);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', JSON.stringify(err, null, 2));
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Usage in component:
function UserComponent() {
  const { data, loading, error } = useApi('/api/user');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <pre>Error: {JSON.stringify(error, null, 2)}</pre>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <DebugView data={data} />
    </div>
  );
}