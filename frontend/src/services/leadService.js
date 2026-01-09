// src/services/leadService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const leadService = {
  getAllLeads: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leads`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data; // React Query expects the data directly
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error; // Important: throw error for React Query to catch
    }
  },

  getLeadById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`);
    if (!response.ok) throw new Error('Failed to fetch lead');
    return response.json();
  },

  createLead: async (leadData) => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    if (!response.ok) throw new Error('Failed to create lead');
    return response.json();
  }
};

export default leadService;