import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/common/Table/DataTable';
import LeadFilters from '../components/leads/LeadFilters';
import JoinLeadModal from '../components/common/Modal/JoinLeadModal';
import { leadService } from '../services/leadService';
import toast from 'react-hot-toast';

const LeadsPage = () => {
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadService.getAllLeads(filters),
  });

  const { data: stats } = useQuery({
    queryKey: ['leadStats'],
    queryFn: () => leadService.getLeadStats(),
  });

  // Normalize responses so components always get expected shapes
  const leadRows = React.useMemo(() => {
    if (!leads) return [];
    if (Array.isArray(leads)) return leads;
    if (Array.isArray(leads.data)) return leads.data;
    // Handle nested responses like { success: true, data: { data: [...] } }
    if (leads.data && Array.isArray(leads.data.data)) return leads.data.data;
    return [];
  }, [leads]);

  const statsObj = React.useMemo(() => (stats && (stats.data ?? stats)) || {}, [stats]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => leadService.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads', filters]);
      toast.success('Lead status updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Update failed');
    }
  });

  const handleViewLead = React.useCallback((lead) => {
    console.log('View lead:', lead);
    setSelectedLead(lead);
    setShowJoinModal(true);
  }, [setSelectedLead, setShowJoinModal]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'leadId',
      },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        ),
      },
      {
        Header: 'Phone',
        accessor: 'phone',
      },
      {
        Header: 'Source',
        accessor: 'source',
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value}
          </span>
        ),
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row }) => {
          const statusColors = {
            new: 'bg-yellow-100 text-yellow-800',
            contacted: 'bg-blue-100 text-blue-800',
            qualified: 'bg-green-100 text-green-800',
            converted: 'bg-purple-100 text-purple-800',
            closed: 'bg-red-100 text-red-800'
          };

          return (
            <div className="flex items-center">
              <select
                value={row.original.status}
                onChange={(e) => updateStatusMutation.mutate({
                  id: row.original._id,
                  status: e.target.value
                })}
                className={`text-xs font-medium rounded-full px-3 py-1 ${statusColors[row.original.status] || 'bg-gray-100 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
        Header: 'Created',
        accessor: 'createdAt',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedLead(row.original);
                setShowJoinModal(true);
              }}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              Convert
            </button>
            <button
              onClick={() => handleViewLead(row.original)}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              View
            </button>
          </div>
        ),
      },
    ],
    [updateStatusMutation, handleViewLead]
  );

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    setSelectedLead(null);
    queryClient.invalidateQueries(['leads', filters]);
    queryClient.invalidateQueries('leadStats');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Leads Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage potential students
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsObj && Object.entries(statsObj).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <LeadFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={leadRows}
          isLoading={isLoading}
          onRowClick={handleViewLead}
        />
      </div>

      {/* Modals */}
      {showJoinModal && (
        <JoinLeadModal
          lead={selectedLead}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedLead(null);
          }}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
};

export default LeadsPage;