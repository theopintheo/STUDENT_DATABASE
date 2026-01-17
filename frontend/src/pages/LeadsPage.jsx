// src/pages/LeadsPage.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

import './LeadsPage.css';
import DataTable from '../components/common/Table/DataTable';
import LeadFilters from '../components/leads/LeadFilters';
import AddLeadModal from '../components/common/Modal/AddLeadModal';
import ViewLeadModal from '../components/common/Modal/ViewLeadModal';
import { leadService } from '../services/leadService'; // ✅ Only one import

// Helper for proper handling of partial selection state
const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        {...rest}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    );
  }
);

const LeadsPage = () => {
  // State
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const queryClient = useQueryClient();

  // Fetch leads
  const {
    data: leadsResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['leads', filters, pageIndex, pageSize],
    queryFn: () => leadService.getAllLeads({
      ...filters,
      page: pageIndex + 1,
      limit: pageSize
    }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch lead stats
  const { data: statsResponse } = useQuery({
    queryKey: ['leadStats'],
    queryFn: () => leadService.getLeadStats(),
  });

  // Transform API response
  const leadRows = useMemo(() => {
    if (!leadsResponse) return [];

    const response = leadsResponse.data || leadsResponse;

    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (response && response.leads) {
      return response.leads;
    }

    return [];
  }, [leadsResponse]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    if (!leadsResponse) return { total: 0, pageCount: 0 };

    const response = leadsResponse.data || leadsResponse;

    return {
      total: response.total || response.count || leadRows.length,
      pageCount: response.totalPages || Math.ceil((response.total || leadRows.length) / pageSize),
      currentPage: response.currentPage || pageIndex + 1,
      hasNextPage: response.hasNextPage || (pageIndex + 1) < (response.totalPages || 1)
    };
  }, [leadsResponse, leadRows.length, pageSize, pageIndex]);

  // Transform stats
  const statsObj = useMemo(() => {
    if (!statsResponse) return {
      total: 0,
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      closed: 0
    };

    const statsData = statsResponse.data || statsResponse;

    return {
      total: statsData.total || leadRows.length,
      new: statsData.new || leadRows.filter(l => l.status === 'new').length,
      contacted: statsData.contacted || leadRows.filter(l => l.status === 'contacted').length,
      qualified: statsData.qualified || leadRows.filter(l => l.status === 'qualified').length,
      converted: statsData.converted || leadRows.filter(l => l.status === 'converted').length,
      closed: statsData.closed || leadRows.filter(l => l.status === 'closed').length
    };
  }, [statsResponse, leadRows]);

  // Mutations
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, status }) => leadService.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update lead status');
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => leadService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['leadStats']);
      toast.success('Lead deleted successfully');
      setSelectedRows([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete lead');
    }
  });

  const deleteBulkMutation = useMutation({
    mutationFn: (ids) => leadService.deleteBulkLeads(ids),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['leadStats']);
      toast.success('Selected leads deleted successfully');
      setSelectedRows([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete leads');
    }
  });

  // Event handlers
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPageIndex(0);
  }, []);

  const handleViewLead = useCallback((lead) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  }, []);

  const handleEditLead = useCallback((lead) => {
    setSelectedLead(lead);
    setShowAddModal(true);
  }, []);

  const handleDeleteLead = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLeadMutation.mutate(id);
    }
  }, [deleteLeadMutation]);

  const handleAddSuccess = useCallback(() => {
    setShowAddModal(false);
    setSelectedLead(null);
    queryClient.invalidateQueries(['leads']);
    queryClient.invalidateQueries(['leadStats']);
    toast.success('Lead added successfully');
  }, [queryClient]);

  const handleUpdateSuccess = useCallback(() => {
    setShowAddModal(false);
    setSelectedLead(null);
    queryClient.invalidateQueries(['leads']);
    queryClient.invalidateQueries(['leadStats']);
    toast.success('Lead updated successfully');
  }, [queryClient]);

  const handleConvertLead = useCallback((lead) => {
    // Handle lead conversion to student
    toast.success('Lead conversion feature coming soon');
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedRows.length === 0) {
      toast.error('No leads selected');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} leads?`)) {
      deleteBulkMutation.mutate(selectedRows);
    }
  }, [selectedRows, deleteBulkMutation]);

  const handleExport = useCallback(() => {
    toast.success('Export feature coming soon');
  }, []);

  const handleRowSelection = useCallback((rows) => {
    setSelectedRows(rows.map(row => row.original._id).filter(id => id));
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPageIndex(old => Math.max(old - 1, 0));
  }, []);

  const handleNextPage = useCallback(() => {
    setPageIndex(old => old + 1);
  }, []);

  const handlePageSizeChange = useCallback((e) => {
    setPageSize(Number(e.target.value));
    setPageIndex(0);
  }, []);

  // Table columns
  const columns = useMemo(() => [
    {
      id: 'selection',
      Header: ({ getToggleAllPageRowsSelectedProps }) => (
        <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
      ),
      Cell: ({ row }) => (
        <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
      ),
      width: 50,
    },
    // ... (rest of columns)
    {
      Header: 'Lead ID',
      accessor: 'leadId',
      Cell: ({ value }) => (
        <span className="font-mono text-sm font-semibold text-gray-900">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      Header: 'Name',
      accessor: 'name',
      Cell: ({ row }) => {
        const lead = row.original;
        const name = lead.name || lead.fullName || 'N/A';
        const email = lead.email || lead.contactEmail || 'N/A';

        return (
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">{email}</div>
          </div>
        );
      },
    },
    {
      Header: 'Contact',
      accessor: 'phone',
      Cell: ({ row }) => {
        const lead = row.original;
        const phone = lead.phone || lead.contactPhone || 'N/A';
        const email = lead.email || lead.contactEmail || 'N/A';

        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <EnvelopeIcon className="h-3 w-3 mr-1" />
              <span>{email}</span>
            </div>
          </div>
        );
      },
    },
    {
      Header: 'Source',
      accessor: 'source',
      Cell: ({ value }) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          {value || 'Unknown'}
        </span>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }) => {
        const status = row.original.status || 'new';
        const statusConfig = {
          new: { color: 'bg-yellow-100 text-yellow-800', label: 'New' },
          contacted: { color: 'bg-blue-100 text-blue-800', label: 'Contacted' },
          qualified: { color: 'bg-green-100 text-green-800', label: 'Qualified' },
          converted: { color: 'bg-purple-100 text-purple-800', label: 'Converted' },
          closed: { color: 'bg-red-100 text-red-800', label: 'Closed' },
        };

        const config = statusConfig[status] || statusConfig.new;

        return (
          <div className="flex items-center">
            <select
              value={status}
              onChange={(e) => updateLeadMutation.mutate({
                id: row.original._id,
                status: e.target.value
              })}
              className={`text-xs font-medium rounded-full px-3 py-1 ${config.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer`}
              disabled={updateLeadMutation.isLoading}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        );
      },
    },
    {
      Header: 'Interest',
      accessor: 'interestLevel',
      Cell: ({ value }) => {
        const level = value || 'low';
        const config = {
          high: { color: 'bg-green-100 text-green-800', label: 'High' },
          medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
          low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
        };

        const { color, label } = config[level] || config.low;

        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}>
            {label}
          </span>
        );
      },
    },
    {
      Header: 'Created',
      accessor: 'createdAt',
      Cell: ({ value }) => (
        <div>
          <div className="text-sm text-gray-900">
            {value ? new Date(value).toLocaleDateString() : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </div>
      ),
    },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleConvertLead(row.original)}
            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 text-sm font-medium"
            title="Convert to Student"
          >
            Convert
          </button>
          <button
            onClick={() => handleViewLead(row.original)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
            title="View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleEditLead(row.original)}
            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteLead(row.original._id)}
            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
            title="Delete"
            disabled={deleteLeadMutation.isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ], [updateLeadMutation, deleteLeadMutation, handleConvertLead, handleViewLead, handleEditLead, handleDeleteLead]);

  // Loading and error states
  if (isLoading && pageIndex === 0) {
    return (
      <div className="leads-page">
        <div className="leads-loading">
          <div className="loading-spinner"></div>
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="leads-page">
        <div className="leads-error">
          <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Leads</h3>
          <p className="mt-2 text-sm text-gray-500">{error.message}</p>
          <button
            onClick={() => queryClient.refetchQueries(['leads'])}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leads-page">
      {/* Header */}
      <div className="leads-header">
        <div className="leads-title">
          <h1>Leads Management</h1>
          <p>Track and manage potential students • {leadRows.length} leads</p>
        </div>
        <div className="leads-actions">
          <button
            onClick={handleExport}
            className="btn btn-secondary"
            disabled={leadRows.length === 0}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="leads-stats">
        <div className="stat-card" onClick={() => handleFilterChange({ status: '' })}>
          <h3>Total Leads</h3>
          <div className="stat-value">{statsObj.total}</div>
          <div className="stat-change">
            <span>All potential leads</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleFilterChange({ status: 'new' })}>
          <h3>New</h3>
          <div className="stat-value">{statsObj.new}</div>
          <div className="stat-change">
            <span>Require initial contact</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleFilterChange({ status: 'contacted' })}>
          <h3>Contacted</h3>
          <div className="stat-value">{statsObj.contacted}</div>
          <div className="stat-change">
            <span>Initial contact made</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleFilterChange({ status: 'qualified' })}>
          <h3>Qualified</h3>
          <div className="stat-value">{statsObj.qualified}</div>
          <div className="stat-change">
            <span>Ready for conversion</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <LeadFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-selection">
            <span className="font-medium">{selectedRows.length} leads selected</span>
          </div>
          <div className="bulk-buttons">
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger"
              disabled={deleteBulkMutation.isLoading}
            >
              {deleteBulkMutation.isLoading ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <DataTable
          columns={columns}
          data={leadRows}
          isLoading={isLoading && pageIndex > 0}
          onRowClick={handleViewLead}
          onRowSelectionChange={handleRowSelection}
          emptyMessage={
            leadRows.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.5l-5.5 5.5m0 0l-5.5-5.5m5.5 5.5V3" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No leads found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {Object.values(filters).some(f => f)
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first lead'}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Lead
                </button>
              </div>
            ) : undefined
          }
        />

        {/* Pagination */}
        {leadRows.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, paginationInfo.total)} of {paginationInfo.total} leads
            </div>
            <div className="flex items-center gap-4">
              <div className="pagination-page-size">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="ml-2 rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[5, 10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pagination-controls">
                <button
                  onClick={handlePreviousPage}
                  disabled={pageIndex === 0}
                  className="pagination-button"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, paginationInfo.pageCount) }, (_, i) => {
                  let pageNum;
                  if (paginationInfo.pageCount <= 5) {
                    pageNum = i;
                  } else if (pageIndex < 3) {
                    pageNum = i;
                  } else if (pageIndex > paginationInfo.pageCount - 4) {
                    pageNum = paginationInfo.pageCount - 5 + i;
                  } else {
                    pageNum = pageIndex - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPageIndex(pageNum)}
                      className={`pagination-button ${pageIndex === pageNum ? 'active' : ''}`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={handleNextPage}
                  disabled={pageIndex >= paginationInfo.pageCount - 1}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddLeadModal
          lead={selectedLead}
          onClose={() => {
            setShowAddModal(false);
            setSelectedLead(null);
          }}
          onSuccess={selectedLead ? handleUpdateSuccess : handleAddSuccess}
        />
      )}

      {showViewModal && selectedLead && (
        <ViewLeadModal
          lead={selectedLead}
          onClose={() => {
            setShowViewModal(false);
            setSelectedLead(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowAddModal(true);
          }}
          onConvert={handleConvertLead}
        />
      )}
    </div>
  );
};
export default LeadsPage;