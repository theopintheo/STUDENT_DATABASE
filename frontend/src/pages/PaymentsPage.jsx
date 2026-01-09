import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';
import './PaymentsPage.css';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await paymentService.getPayments();
        const payload = res?.data ?? res;
        const list = payload?.data ?? payload ?? [];
        if (mounted) setPayments(list);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPayments();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="payments-page">
      <h1>Payments</h1>
      {user && <p>Welcome, {user.name || user.email || 'User'}</p>}

      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <ul>
          {payments.map((p) => (
            <li key={p.id || p._id}>
              <strong>{p.studentName || p.student?.name || 'Student'}</strong> — {p.amount} {p.currency || 'USD'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaymentsPage;