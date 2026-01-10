// src/services/leadService.js
// Prefer Vite env var if available, fall back to CRA-style or localhost
// const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
//   || process.env.REACT_APP_API_URL
//   || 'http://localhost:5000/api';

// async function parseJsonOrText(response) {
//   const ct = response.headers.get('content-type') || '';
//   const text = await response.text();
//   if (ct.includes('application/json')) {
//     try {
//       return JSON.parse(text);
//     } catch (err) {
//       // JSON parsing failed even though content-type claimed JSON
//       const e = new Error(`Invalid JSON response: ${err.message}`);
//       e.responseText = text.slice(0, 1000);
//       throw e;
//     }
//   }
//   // Not JSON: return the text so the caller can include it in an error
//   const e = new Error(`Expected JSON but got '${ct || 'unknown'}'`);
//   e.responseText = text.slice(0, 1000);
//   throw e;
// }

// export const leadService = {
//   getAllLeads: async () => {
//     const url = `${API_BASE_URL}/leads`;
//     let response;
//     try {
//       response = await fetch(url, { method: 'GET' });
     
//     } catch (err) {
//       console.error(`Network error fetching ${url}:`, err);
//       throw new Error(`Network error fetching leads: ${err.message}`);
//     }

//     if (!response.ok) {
//       const preview = await response.json().catch(() => '');
//       const err = new Error(`Failed to fetch leads: ${response.status} ${response.statusText}`);
//       err.status = response.status;
//       err.preview = preview.slice(0, 1000);
//       console.error(err);
//       throw err;
//     }

//     // Ensure the response is JSON and parse it, otherwise throw with a helpful message
//     try {
//       const data = await parseJsonOrText(response);
//       return data;
//     } catch (err) {
//       const e = new Error(`Error parsing leads response from ${url}: ${err.message}`);
//       e.preview = err.responseText || err.preview;
//       console.error(e);
//       throw e;
//     }
//   },

//   getLeadById: async (id) => {
//     const url = `${API_BASE_URL}/leads/${id}`;
//     const response = await fetch(url);
//     if (!response.ok) {
//       const text = await response.text().catch(() => '');
//       const e = new Error(`Failed to fetch lead ${id}: ${response.status}`);
//       e.preview = text.slice(0, 500);
//       throw e;
//     }
//     return parseJsonOrText(response);
//   },

//   createLead: async (leadData) => {
//     const response = await fetch(`${API_BASE_URL}/leads`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(leadData)
//     });
//     if (!response.ok) {
//       const text = await response.text().catch(() => '');
//       const e = new Error(`Failed to create lead: ${response.status}`);
//       e.preview = text.slice(0, 500);
//       throw e;
//     }
//     return parseJsonOrText(response);
//   }
// };

// export default leadService;

// src/services/leadService.js

// Prefer Vite env var if available, fall back to CRA-style or localhost
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  || process.env.REACT_APP_API_URL
  || 'http://localhost:5000/api';

// Get token from localStorage
function getAuthToken() {
  return localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('accessToken') ||
         sessionStorage.getItem('token');
}

// Common headers with authentication
function getHeaders() {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

async function parseJsonOrText(response) {
  const ct = response.headers.get('content-type') || '';
  const text = await response.text();
  
  // Try to parse as JSON if content-type suggests it
  if (ct.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    try {
      return JSON.parse(text);
    } catch (err) {
      // JSON parsing failed
      const e = new Error(`Invalid JSON response: ${err.message}`);
      e.responseText = text.slice(0, 1000);
      throw e;
    }
  }
  
  // Not JSON
  const e = new Error(`Expected JSON but got '${ct || 'unknown'}'`);
  e.responseText = text.slice(0, 1000);
  throw e;
}

export const leadService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAuthToken();
    return !!token;
  },

  // Get authentication token
  getToken: () => getAuthToken(),

  // Clear authentication
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('token');
  },

  // Set authentication token
  setToken: (token, remember = true) => {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  },

  // Get all leads with authentication
  getAllLeads: async () => {
    const url = `${API_BASE_URL}/students`;
    
    console.log('Fetching from:', url);
    console.log('Token available:', !!getAuthToken());
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include' // Include cookies if needed
      });

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        console.warn('Authentication failed, token might be expired');
        // Optionally clear the token
        leadService.logout();
        throw new Error('Authentication required. Please log in again.');
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        
        const err = new Error(`Failed to fetch leads: ${response.status} ${response.statusText}`);
        err.status = response.status;
        err.data = errorData;
        console.error('API Error:', err);
        throw err;
      }

      // Parse response
      const data = await parseJsonOrText(response);
      console.log('Leads fetched successfully:', data);
      return data;

    } catch (err) {
      console.error(`Network error fetching ${url}:`, err);
      
      // Check if it's an auth error
      if (err.message.includes('Authentication') || err.message.includes('401')) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      // Check if server is returning HTML (like 404 page)
      if (err.message.includes('Expected JSON but got') && err.message.includes('text/html')) {
        console.warn('Server is returning HTML instead of JSON. Possible issues:');
        console.warn('1. API endpoint does not exist:', url);
        console.warn('2. Backend server is not running');
        console.warn('3. Wrong API_BASE_URL:', API_BASE_URL);
        
        // Fallback to mock data for development
        return leadService.getMockLeads();
      }
      
      throw new Error(`Error fetching leads: ${err.message}`);
    }
  },

  // Get single lead
  getLeadById: async (id) => {
    const url = `${API_BASE_URL}/leads/${id}`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      const e = new Error(`Failed to fetch lead ${id}: ${response.status}`);
      e.preview = text.slice(0, 500);
      throw e;
    }
    
    return parseJsonOrText(response);
  },

  // Create lead
  createLead: async (leadData) => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leadData)
    });
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      const e = new Error(`Failed to create lead: ${response.status}`);
      e.preview = text.slice(0, 500);
      throw e;
    }
    
    return parseJsonOrText(response);
  },

  // Update lead
  updateLead: async (id, leadData) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(leadData)
    });
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      const e = new Error(`Failed to update lead ${id}: ${response.status}`);
      e.preview = text.slice(0, 500);
      throw e;
    }
    
    return parseJsonOrText(response);
  },

  // Delete lead
  deleteLead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      const e = new Error(`Failed to delete lead ${id}: ${response.status}`);
      e.preview = text.slice(0, 500);
      throw e;
    }
    
    return parseJsonOrText(response);
  },

  // Authentication methods
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      const e = new Error(`Login failed: ${response.status}`);
      e.preview = text.slice(0, 500);
      throw e;
    }
    
    const data = await parseJsonOrText(response);
    
    // Save token if present in response
    if (data.token || data.accessToken) {
      const token = data.token || data.accessToken;
      leadService.setToken(token, credentials.remember || true);
    }
    
    return data;
  },

  // Mock data fallback for development
  getMockLeads: () => {
    console.log('⚠️ Using mock data - API endpoint not available or returning HTML');
    
    return {
      success: true,
      data: [
        { 
          id: 1, 
          name: 'John Doe', 
          email: 'john@example.com', 
          phone: '+1-555-0101',
          status: 'new',
          source: 'website',
          createdAt: new Date().toISOString()
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          phone: '+1-555-0102',
          status: 'contacted',
          source: 'referral',
          createdAt: new Date(Date.now() - 86400000).toISOString() // yesterday
        },
        { 
          id: 3, 
          name: 'Bob Johnson', 
          email: 'bob@example.com', 
          phone: '+1-555-0103',
          status: 'qualified',
          source: 'conference',
          createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ],
      count: 3,
      message: 'Using mock data. Please configure your backend API.'
    };
  }
};

export default leadService;