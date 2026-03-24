import React from 'react';
import Navbar from '../components/Navbar';
import { useGeneralData } from './GeneralController';
import styles from './Pages.module.css';
import { Check, X } from 'lucide-react';

const RegistrationView = () => {
  const { requests } = useGeneralData();

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.tableCard} style={{ margin: '28px 40px' }}>
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
            {requests?.map((req) => (
              <tr key={req.id}>
                <td className={styles.teamName}>{req.player}</td>
                <td style={{ color: '#666' }}>{req.team}</td>
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
                    <button style={{ background: '#22c55e', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer' }}>
                      <Check size={16} color="white" />
                    </button>
                    <button style={{ background: '#ff4655', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer' }}>
                      <X size={16} color="white" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationView;
