import React, { useEffect, useState } from 'react';
import { listCalls, Call } from '../api';

const Calls = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const data = await listCalls();
      setCalls(data);
    } catch (err) {
      console.error('Failed to fetch calls:', err);
      setError('Failed to load calls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  if (loading) {
    return (
      <div className="calls-page">
        <div className="calls-header">
          <h1 className="calls-title">Calls List</h1>
        </div>
        <div className="calls-loading">
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading calls…</span>
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calls-page">
        <p className="calls-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="calls-page">
      <div className="calls-header">
        <h1 className="calls-title">Calls List</h1>
        <button className="btn btn-secondary calls-refresh" onClick={fetchCalls}>
          Refresh
        </button>
      </div>

      {calls.length === 0 ? (
        <p className="calls-empty">No calls uploaded yet.</p>
      ) : (
        <table className="calls-table">
          <thead>
            <tr>
              <th>Call ID</th>
              <th>Original Filename</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id}>
                <td>{call.id}</td>
                <td>{call.original_filename}</td>
                <td>
                  <span className={`call-status ${call.status.toLowerCase()}`}>
                    {call.status}
                  </span>
                </td>
                <td>{new Date(call.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Calls;
