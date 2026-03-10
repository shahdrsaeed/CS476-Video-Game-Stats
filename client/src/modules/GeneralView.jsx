import React from 'react';
import Header from '../components/Header';
import { useGeneralData } from './GeneralController';
import styles from './Pages.module.css';
import { Activity, ShieldCheck, User } from 'lucide-react';

const GeneralView = () => {
  const { coach, topTeams } = useGeneralData();

  return (
    <div className={styles.container}>
      <Header coach={coach} pageTitle="Coach Dashboard" />
      
      <div className={styles.mainGrid}>
        <div className={styles.profileCard}>
          <div className={styles.profileAvatarLarge}>
             {coach?.avatar ? <img src={coach.avatar} alt="Avatar" /> : <User size={80} color="#333" />}
          </div>
          <h1 className={styles.profileName}>{coach?.name || "EP KOZZY"}</h1>
          <div className={styles.infoList}>
             <div className={styles.infoItem}>
                <span><Activity size={16} color="#ff4655"/> ROLE</span>
                <strong>{coach?.role}</strong>
             </div>
             <div className={styles.infoItem}>
                <span><ShieldCheck size={16} color="#ff4655"/> TEAM</span>
                <strong>PHANTOM ESPORTS</strong>
             </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PLAYER IDENTITY</th>
                <th>RANK</th>
                <th>WIN RATE</th>
                <th style={{textAlign: 'right'}}>K/D</th>
              </tr>
            </thead>
            <tbody>
              {topTeams?.map(player => (
                <tr key={player.id}>
                  <td className={styles.teamName}>
                    <div>
                      <div style={{fontWeight: '900'}}>{player.name}</div>
                      <div style={{fontSize: '10px', color: '#666'}}>{player.level || "LEVEL 100"}</div>
                    </div>
                  </td>
                  <td><span className={styles.rankBadge}>{player.currentRank}</span></td>
                  <td><span className={styles.winRate}>{player.winRate || "50%"}</span></td>
                  <td className={styles.points} style={{textAlign: 'right'}}>{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralView;