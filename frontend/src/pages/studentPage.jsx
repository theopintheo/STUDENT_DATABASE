import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './studentPage.css'; // Make sure this import is correct
import { PlusIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/common/Table/DataTable';
import JoinLeadModal from '../components/common/Modal/JoinLeadModal';
import AddLeadModal from '../components/common/Modal/AddLeadModal';
import { studentService } from '../services/studentService';
import toast from 'react-hot-toast';
import StudentFilters from '../components/students/StudentFilters';
const StudentPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    branch: '',
    startDate: '',
    endDate: '',
    admissionType: '',
    course: '',
    feeStatus: ''
  });
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedstudent, setSelectedstudent] = useState(null);
  const queryClient = useQueryClient();

  // Fetch leads with filters
  const { data: studentsResponse, isLoading } = useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentService.getAllLeads(filters),
  });

  // Fetch stats
  const { data: statsResponse } = useQuery({
    queryKey: ['studentStats'],
    queryFn: () => studentService.getLeadStats(),
  });

  // Transform API response to match component expectations
  const studentRows = useMemo(() => {
    if (!studentsResponse) return [];

    // Handle different response formats
    const response = studentsResponse.data || studentsResponse;

    if (Array.isArray(response)) {
      return response.map(student => ({
        ...student,
        studentId: student.studentId || student._id,
        name: student.personalDetails?.fullName || student.name || 'N/A',
        email: student.personalDetails?.email || student.email || 'N/A',
        phone: student.personalDetails?.phone || student.phone || 'N/A',
        source: student.admissionDetails?.admissionType || 'unknown',
        status: student.status || 'new',
        createdAt: student.createdAt || student.meta?.createdAt || new Date().toISOString()
      }));
    }

    return [];
  }, [studentsResponse]);

  // Transform stats
  const statsObj = useMemo(() => {
    if (!statsResponse) return {};
    const statsData = statsResponse.data || statsResponse;
    return {
      total: statsData.total || studentRows.length,
      new: statsData.new || studentRows.filter(l => l.status === 'new').length,
      contacted: statsData.contacted || studentRows.filter(l => l.status === 'contacted').length,
      qualified: statsData.qualified || studentRows.filter(l => l.status === 'qualified').length,
      converted: statsData.converted || studentRows.filter(l => l.status === 'converted').length,
      closed: statsData.closed || studentRows.filter(l => l.status === 'closed').length
    };
  }, [statsResponse, studentRows]);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => studentService.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['students', filters]);
      toast.success('student status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    }
  });

  // Handle view lead
  const handleViewLead = useCallback((student) => {
    console.log('Viewing student:', student);
    setSelectedstudent(student);
    setShowJoinModal(true);
  }, []);

  // Table columns
  const columns = useMemo(() => [
    {
      Header: 'ID',
      accessor: 'studentId',
      Cell: ({ value }) => <span className="font-mono text-sm">{value || 'N/A'}</span>
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
      Cell: ({ value }) => <span className="font-medium">{value || 'N/A'}</span>
    },
    {
      Header: 'Source',
      accessor: 'source',
      Cell: ({ value }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {value?.replace(/_/g, ' ') || 'Unknown'}
        </span>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }) => {
        const statusColors = {
          new: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          contacted: 'bg-blue-100 text-blue-800 border-blue-200',
          qualified: 'bg-green-100 text-green-800 border-green-200',
          converted: 'bg-purple-100 text-purple-800 border-purple-200',
          closed: 'bg-red-100 text-red-800 border-red-200',
          active: 'bg-green-100 text-green-800 border-green-200',
          inactive: 'bg-gray-100 text-gray-800 border-gray-200'
        };

        const colorClass = statusColors[row.original.status] || 'bg-gray-100 text-gray-800 border-gray-200';

        return (
          <div className="flex items-center">
            <select
              value={row.original.status}
              onChange={(e) => updateStatusMutation.mutate({
                id: row.original._id,
                status: e.target.value
              })}
              className={`text-xs font-medium rounded-full px-3 py-1 border ${colorClass} focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer`}
              disabled={updateStatusMutation.isLoading}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        );
      },
    },
    {
      Header: 'Created Date',
      accessor: 'createdAt',
      Cell: ({ value }) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      Header: 'Actions',
      Cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedstudent(row.original);
              setShowJoinModal(true);
            }}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium px-3 py-1 hover:bg-primary-50 rounded"
          >
            Convert
          </button>
          <button
            onClick={() => handleViewLead(row.original)}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1 hover:bg-gray-50 rounded"
          >
            View
          </button>
        </div>
      ),
    },
  ], [updateStatusMutation, handleViewLead]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle join success
  const handleJoinSuccess = useCallback(() => {
    setShowJoinModal(false);
    setSelectedstudent(null);
    queryClient.invalidateQueries(['students', filters]);
    queryClient.invalidateQueries(['studentStats']);
    toast.success('student processed successfully');
  }, [queryClient, filters]);

  // Add this inside your StudentPage component, before the return statement
  const handleLeadSuccess = useCallback(() => {
    setShowJoinModal(false);
    // Refresh the data
    queryClient.invalidateQueries(['students', filters]);
    queryClient.invalidateQueries(['studentStats']);
    toast.success('Lead processed successfully');
  }, [queryClient, filters]);

  return (
    <div className="space-y-6 students-page">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between students-header">
        <div className="flex-1 min-w-0 students-title">
          <h2 className="text-2xl font-bold studenting-7 text-gray-900 sm:text-3xl">
            students Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage potential students ({studentRows.length} students)
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 students-actions">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 students-stats">
        {Object.entries(statsObj).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow stat-card">
            <div className="text-sm font-medium text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 stat-value">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow students-filters">
        <StudentFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={studentRows}
          isLoading={isLoading}
          onRowClick={handleViewLead}
          emptyMessage={studentRows.length === 0 ? 'No students found. Try adjusting your filters.' : undefined}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleLeadSuccess}
        />
      )}

      {showJoinModal && (
        <JoinLeadModal
          student={selectedstudent}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedstudent(null);
          }}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
};

export default StudentPage;