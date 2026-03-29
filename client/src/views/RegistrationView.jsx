import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import styles from './Pages.module.css';
import { Check, X } from 'lucide-react';

const RegistrationView = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');

  // Fetch requests from API on mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/requests', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
  }, []);

  // Approve done via API call
  const handleApprove = async (id) => {
    try {
      await fetch(`/api/requests/${id}/approve`, {
        method: 'PUT'
      });

      // update UI
      setRequests(prev =>
        prev.map(r =>
          r._id === id ? { ...r, status: 'Approved' } : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Reject done via API call
  const handleReject = async (id) => {
    try {
      await fetch(`/api/requests/${id}/reject`, {
        method: 'DELETE'
      });

      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.tableCard} style={{ margin: '28px 40px' }}>
        {requests.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#444', fontSize: 13, letterSpacing: 2 }}>
            NO PENDING REGISTRATIONS
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PLAYER NAME</th>
                <th>TEAM TARGET</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td className={styles.teamName}>{req.player.username}</td>
                  <td style={{ color: '#666' }}>{req.team.teamName}</td>
                  <td style={{ fontSize: '12px' }}>{req.date}</td>
                  <td>
                    <span className={styles.winRate} style={{
                      background: req.status === 'Approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                      color: req.status === 'Approved' ? '#22c55e' : '#ffa500'
                    }}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      {req.status !== 'Approved' && (
                        <button
                          style={{ background: '#22c55e', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer' }}
                          onClick={() => handleApprove(req._id)}
                        >
                          <Check size={16} color="white" />
                        </button>
                      )}
                      <button
                        style={{ background: '#ff4655', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer' }}
                        onClick={() => handleReject(req._id)}
                      >
                        <X size={16} color="white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RegistrationView;
