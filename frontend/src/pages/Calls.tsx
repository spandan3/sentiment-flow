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

  if (loading) return <p>Loading calls...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Calls List</h1>
      <button onClick={fetchCalls} style={{ marginBottom: '1rem' }}>Refresh</button>
      
      {calls.length === 0 ? (
        <p>No calls uploaded yet.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px' }}>Call ID</th>
              <th style={{ padding: '8px' }}>Original Filename</th>
              <th style={{ padding: '8px' }}>Status</th>
              <th style={{ padding: '8px' }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id}>
                <td style={{ padding: '8px' }}>{call.id}</td>
                <td style={{ padding: '8px' }}>{call.original_filename}</td>
                <td style={{ padding: '8px' }}>{call.status}</td>
                <td style={{ padding: '8px' }}>{new Date(call.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Calls;
