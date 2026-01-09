import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { studentService } from '../services/studentService';
import './StudentsPage.css';

const StudentsPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await studentService.getStudents();
        // axios responses place the payload on res.data
        const payload = res?.data ?? res;
        const list = payload?.data ?? payload ?? [];
        if (mounted) setStudents(list);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading students...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="students-page">
      <h1>Students</h1>
      {user && <p>Welcome, {user.name || user.email || 'User'}</p>}

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul>
          {students.map((s) => (
            <li key={s.id || s._id}>{s.name || s.fullName || `${s.firstName || ''} ${s.lastName || ''}`}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentsPage;