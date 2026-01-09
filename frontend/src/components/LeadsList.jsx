import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadService } from '../services/leadService';

const LeadsList = () => {
  // ✅ CORRECT - Using queryFn
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['leads'], // Unique key for this query
    queryFn: () => leadService.getAllLeads(), // ✅ queryFn provided
    // Optional configurations:
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <div>Loading leads...</div>;
  }

  if (isError) {
    return (
      <div>
        Error: {error.message}
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  // Note: React Query returns the data directly from queryFn
  // If your API returns { success: true, data: [...] }, you need to handle it
  const leads = data?.data || data || [];

  return (
    <div>
      <h2>Leads List</h2>
      <button onClick={() => refetch()}>Refresh</button>
      
      {leads.length === 0 ? (
        <p>No leads found.</p>
      ) : (
        <ul>
          {leads.map(lead => (
            <li key={lead.id}>
              <strong>{lead.name}</strong> - {lead.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LeadsList;