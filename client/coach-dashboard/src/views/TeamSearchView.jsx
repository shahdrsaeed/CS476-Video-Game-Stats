import React, { useState } from 'react';
import Header from '../components/Header';
import { useGeneralData } from './GeneralController';
import styles from './Pages.module.css';
import { Trophy, Search, Users } from 'lucide-react';

const TeamSearchView = () => {
  const { coach, topTeams } = useGeneralData();
  const [searchQuery, setSearchQuery] = useState("");

  // Logic lọc: Tìm kiếm theo tên Player hoặc tên Đội
  const filteredData = topTeams?.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.level && item.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={styles.container}>
      {/* Quan trọng: Truyền setSearchQuery để Header cập nhật trạng thái ở đây */}
      <Header 
        coach={coach} 
        pageTitle="GLOBAL SEARCH" 
        setSearchQuery={setSearchQuery} 
      />
      
      <div className={styles.tableCard}>
        <div style={{ padding: '20px', borderBottom: '1px solid #2d3946', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="#ff4655" />
          <span style={{ fontWeight: '900', fontSize: '12px' }}>
            {searchQuery ? `SEARCH RESULTS FOR: "${searchQuery.toUpperCase()}"` : "ALL PLAYERS / TEAMS"}
          </span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>RANK</th>
              <th>IDENTITY</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>POINTS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ color: '#ff4655', fontWeight: '900' }}>
                    {index === 0 ? <Trophy size={16} /> : `#${index + 1}`}
                  </td>
                  <td className={styles.teamName}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={16} color="#444" />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ fontSize: '10px', color: '#666' }}>{item.level || "VERIFIED"}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.rankBadge}>{item.currentRank}</span></td>
                  <td className={styles.points} style={{ textAlign: 'right' }}>{item.points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                  NO RESULTS FOUND FOR "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamSearchView;