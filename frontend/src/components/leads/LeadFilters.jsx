import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';

const LeadFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    source: initialFilters.source || '',
    assignedTo: initialFilters.assignedTo || '',
    dateRange: initialFilters.dateRange || '',
    search: initialFilters.search || '',
    followUpDate: initialFilters.followUpDate || '',
  });

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      source: '',
      assignedTo: '',
      dateRange: '',
      search: '',
      followUpDate: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' },
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'walkin', label: 'Walk-in' },
    { value: 'other', label: 'Other' },
  ];

  const assignedOptions = [
    { value: '', label: 'All Staff' },
    { value: 'unassigned', label: 'Unassigned' },
    { value: 'user1', label: 'John Doe' },
    { value: 'user2', label: 'Jane Smith' },
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
  ];

  return (
    <div className="lead-filters">
      <div className="filter-header">
        <Filter size={18} />
        <h3>Filters</h3>
      </div>
      
      <div className="filter-grid">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Source</label>
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="filter-select"
          >
            {sourceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Assigned To</label>
          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="filter-select"
          >
            {assignedOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="filter-select"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Follow-up Date</label>
          <input
            type="date"
            value={filters.followUpDate}
            onChange={(e) => handleFilterChange('followUpDate', e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group col-span-2">
          <label className="filter-label">
            <Search size={14} />
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="search-input"
          />
        </div>
      </div>
      
      <div className="filter-actions">
        <button onClick={handleReset} className="btn btn-secondary">
          Reset Filters
        </button>
        <button 
          onClick={() => onFilterChange(filters)} 
          className="btn btn-primary"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default LeadFilters;