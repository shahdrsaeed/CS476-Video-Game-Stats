/*
import React from 'react';
import Navbar from '../components/Navbar';
import { useGeneralData } from './GeneralController';
import styles from './Pages.module.css';
import { Activity, ShieldCheck, User } from 'lucide-react';

const GeneralView = () => {
  const { coach, topTeams } = useGeneralData();

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.mainGrid}>
        <div className={styles.profileCard}>
          <div className={styles.profileAvatarLarge}>
            {coach?.avatar ? <img src={coach.avatar} alt="Avatar" /> : <User size={80} color="#333" />}
          </div>
          <h1 className={styles.profileName}>{coach?.name || "EP KOZZY"}</h1>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span><Activity size={16} color="#ff4655" /> ROLE</span>
              <strong>{coach?.role}</strong>
            </div>
            <div className={styles.infoItem}>
              <span><ShieldCheck size={16} color="#ff4655" /> TEAM</span>
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
                <th style={{ textAlign: 'right' }}>K/D</th>
              </tr>
            </thead>
            <tbody>
              {topTeams?.map(player => (
                <tr key={player.id}>
                  <td className={styles.teamName}>
                    <div>
                      <div style={{ fontWeight: '900' }}>{player.name}</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>LEVEL {player.level}</div>
                    </div>
                  </td>
                  <td><span className={styles.rankBadge}>{player.currentRank}</span></td>
                  <td><span className={styles.winRate}>{player.winRate}</span></td>
                  <td className={styles.points} style={{ textAlign: 'right' }}>{player.kdRatio}</td>
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

*/

import React from 'react';
import Navbar from '../components/Navbar';
import { useGeneralData } from '../hooks/GeneralController';
import styles from './Pages.module.css';
import { Activity, ShieldCheck, User } from 'lucide-react';

const GeneralView = () => {
  const { coach, topTeams, loading } = useGeneralData();

  // ── Loading state ──
  if (loading) return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.emptyState}>
        <p className={styles.emptyStateTitle}>LOADING...</p>
      </div>
    </div>
  );

  // ── No coach found ──
  if (!coach) return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.emptyState}>
        <ShieldCheck size={48} color="#333" />
        <p className={styles.emptyStateTitle}>NO COACH PROFILE FOUND</p>
        <p className={styles.emptyStateSubtitle}>You have not been assigned to a coach yet.</p>
      </div>
    </div>
  );

  // ── Coach has no team ──
  if (!coach.teamId) return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.emptyState}>
        <ShieldCheck size={48} color="#333" />
        <p className={styles.emptyStateTitle}>NO TEAM ASSIGNED</p>
        <p className={styles.emptyStateSubtitle}>You do not have a team yet.</p>
      </div>
    </div>
  );

  // ── Main view ──
  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.mainGrid}>

        {/* ── COACH PROFILE CARD ── */}
        <div className={styles.profileCard}>
          <div className={styles.profileAvatarLarge}>
            {coach.imageURL
              ? <img src={coach.imageURL} alt="Avatar" />
              : <User size={80} color="#333" />
            }
          </div>

          <h1 className={styles.profileName}>{coach.username ?? 'Unknown Coach'}</h1>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span><Activity size={16} color="#ff4655" /> ROLE</span>
              {/* title from DB (Head Coach, Assistant Coach, etc.) */}
              <strong>{coach.title ?? 'Head Coach'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span><ShieldCheck size={16} color="#ff4655" /> TEAM</span>
              {/* teamName attached in GeneralController after fetching team */}
              <strong>{coach.teamName ?? 'No Team'}</strong>
            </div>
            {coach.company && (
              <div className={styles.infoItem}>
                <span><ShieldCheck size={16} color="#ff4655" /> ORG</span>
                <strong>{coach.company}</strong>
              </div>
            )}
          </div>
        </div>

        {/* ── PLAYERS TABLE ── */}
        <div className={styles.tableCard}>
          {topTeams.length === 0 ? (
            <div className={styles.emptyState}>
              <User size={40} color="#333" />
              <p className={styles.emptyStateTitle}>NO PLAYERS ON THIS TEAM</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>PLAYER IDENTITY</th>
                  <th>RANK</th>
                  <th>WIN RATE</th>
                  <th style={{ textAlign: 'right' }}>K/D</th>
                </tr>
              </thead>
              <tbody>
                {topTeams.map(player => (
                  <tr key={player._id}>
                    <td className={styles.teamName}>
                      <div>
                        <div style={{ fontWeight: '900' }}>{player.username}</div>
                        <div style={{ fontSize: '10px', color: '#666' }}>LEVEL {player.level}</div>
                      </div>
                    </td>
                    <td><span className={styles.rankBadge}>{player.rank}</span></td>
                    <td><span className={styles.winRate}>{player.winRate}</span></td>
                    <td className={styles.points} style={{ textAlign: 'right' }}>{player.kdRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default GeneralView;
