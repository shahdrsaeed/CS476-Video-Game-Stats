import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllPlayers } from '../services/UserApi'; 
import { Search, Shield, User, ChevronRight, X, UserPlus, Clock, CheckCircle } from 'lucide-react';

// Get the logged-in user from localStorage
const loggedInUser = JSON.parse(localStorage.getItem('user'));

const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('RADIANT'))  return '#ffffa0';
  if (rank.includes('IMMORTAL')) return '#ff4655';
  if (rank.includes('DIAMOND'))  return '#a78bfa';
  if (rank.includes('PLATINUM')) return '#38bdf8';
  return '#888';
};

// Request button logic
const getRequestStatus = (playerName, requests = []) => {
  const found = requests.find(r => r.player === playerName);
  if (!found) return 'none';
  return found.status; // 'Pending' or 'Approved'
};

const TeamSearchView = () => {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState([]);

  // Fetch requests if the user is a coach
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
        setRequests([]); // Ensure requests is always an array
      }
    };

    if (loggedInUser?.role === 'Coach') {
      fetchRequests();
    }
  }, []);

  // Fetch all players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await getAllPlayers();
        setPlayers(res.data);
      } catch (err) {
        console.error('Failed to fetch players:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const handleRequest = async (player) => {
    try {

      // Prevent duplicate requests
      const status = getRequestStatus(player.username, requests);
      if (status !== 'none') return;

      const token = localStorage.getItem('token');

      const body = {
        playerId: player._id,
        teamId: loggedInUser.teamId, // Ensure coach's teamId is properly set
      };

      const res = await fetch(`/api/requests/${loggedInUser._id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to send request');
      }

      const newRequest = await res.json();

      // Update local state to show the request in the UI
      setRequests(prev => [
        ...prev,
        {
          _id: newRequest._id,
          player: { username: player.username },
          team: { teamName: loggedInUser.teamName }, // Coach's team
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
        },
      ]);
    } catch (err) {
      console.error('Failed to send request:', err);
    }
  };

  // Filter players based on search query
  const filtered = players.filter(p =>
    p.username.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <div style={{ color: '#fff', padding: 40 }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.body}>
        {/* Search bar */}
        <div style={styles.searchSection}>
          <h1 style={styles.title}>TEAM SEARCH</h1>
          <p style={styles.subtitle}>Find players and teams across the competitive network</p>
          <div style={styles.searchBar}>
            <Search size={18} color="#555" style={{ flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by player name, Valorant ID, or team..."
              style={styles.searchInput}
              autoFocus
            />
            {query && (
              <button style={styles.clearBtn} onClick={() => setQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div style={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Results grid */}
        <div style={styles.grid}>
          {filtered.length === 0 ? (
            <div style={styles.empty}>
              <User size={40} color="#333" />
              <p style={{ color: '#444', marginTop: 12, letterSpacing: 2 }}>NO PLAYERS FOUND</p>
            </div>
          ) : (
            filtered.map(player => (
              <div
                key={player._id}
                style={styles.card}
                onClick={() => setSelected(player)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,70,85,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1f2e'}
              >
                <div style={styles.cardTop}>
                  { /* Changed this */}
                  <img
                    src={player.imageURL || '/default-avatar.png'}
                    alt={player.username}
                    style={styles.cardAvatar}
                    onError={(e) => { 
                      e.target.onerror = null; // prevents looping
                      e.target.src = '/default-avatar.png'; 
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={styles.cardName}>{player.username}</div>
                    <div style={styles.cardId}>{player.valorantId}</div> {/* not in player schema */}
                    <div style={{ ...styles.cardRank, color: rankColor(player.rank) }}>
                      {player.rank} · {player.rr} RR
                    </div>
                  </div>
                </div>
                <div style={styles.teamBadge}>
                  <Shield size={11} color="#ff4655" style={{ marginRight: 5 }} />
                  {player.teamId ?? 'No Team'}
                </div>
                <div style={styles.cardStats}>
                  {[
                    { label: 'K/D',  value: player.kdRatio },
                    { label: 'WIN%', value: player.winRate },
                    { label: 'ACS',  value: player.stats?.acs },
                    { label: 'HS%',  value: player.headshotPercentage },
                  ].map(s => (
                    <div key={s.label} style={styles.statItem}>
                      <div style={styles.statLabel}>{s.label}</div>
                      <div style={styles.statValue}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <button style={styles.viewBtn}>
                  VIEW PROFILE <ChevronRight size={12} style={{ marginLeft: 4 }} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Player detail modal ── */}
      {selected && (
        <div style={modal.overlay} onClick={() => setSelected(null)}>
          <div style={modal.box} onClick={e => e.stopPropagation()}>

            {/* Header with Request button */}
            <div style={modal.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={selected.avatar} alt={selected.username} style={modal.avatar} />
                <div>
                  <div style={modal.name}>{selected.username}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{selected.valorantId}</div> {/* not in player schema */}
                  <div style={{ fontSize: 14, fontWeight: 900, color: rankColor(selected.rank), marginTop: 4 }}>
                    {selected.rank} · {selected.rr} RR
                  </div>
                </div>
              </div>

              {/* ── REQUEST BUTTON (top right) ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {JSON.parse(localStorage.getItem('user')).role === 'Coach' && (
                  <RequestButton
                    status={getRequestStatus(selected.username, requests)}
                    onClick={() => handleRequest(selected)}
                  />
                )}
                <button style={modal.closeBtn} onClick={() => setSelected(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div style={modal.statsGrid}>
              {[
                { label: 'K/D',     value: selected.kdRatio },
                { label: 'WIN RATE',value: selected.winRate },
                { label: 'ACS',     value: selected.stats?.acs },
                { label: 'HS%',     value: selected.headshotPercentage },
                { label: 'KAST',    value: 'N/A' },
                { label: 'DMG/RND', value: 'N/A' },
                { label: 'KILLS',   value: selected.stats?.kills },
                { label: 'MATCHES', value: (selected.stats?.wins ?? 0) + (selected.stats?.losses ?? 0) },
              ].map(s => (
                <div key={s.label} style={modal.statBox}>
                  <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Top agents */}
            <div style={modal.sectionTitle}><User size={12} color="#ff4655" style={{ marginRight: 6 }} />TOP AGENTS</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr>{['AGENT', 'MATCHES', 'WIN%', 'K/D', 'ACS'].map(h => <th key={h} style={modal.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(selected.topAgents ?? []).map(a => (
                  <tr key={a.name}>
                    <td style={modal.td}><strong style={{ color: '#fff' }}>{a.name}</strong><div style={{ fontSize: 10, color: '#555' }}>{a.role}</div></td>
                    <td style={modal.td}>{a.matches}</td>
                    <td style={{ ...modal.td, color: '#22c55e', fontWeight: 700 }}>{a.winRate}</td>
                    <td style={{ ...modal.td, fontWeight: 700 }}>{a.kd}</td>
                    <td style={{ ...modal.td, color: '#ff4655', fontWeight: 700 }}>{a.acs}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Top maps */}
            <div style={modal.sectionTitle}><Shield size={12} color="#ff4655" style={{ marginRight: 6 }} />TOP MAPS</div>
            {(selected.topMaps ?? []).map(m => (
              <div key={m.map} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a1f2e', padding: '8px 0' }}>
                <span style={{ color: '#fff', fontWeight: 700, flex: 1 }}>{m.map}</span>
                <span style={{ fontSize: 11, color: '#555', marginRight: 16 }}>{m.wins}W - {m.losses}L</span>
                <span style={{ color: '#22c55e', fontWeight: 900 }}>{m.winRate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Request Button Component ──────────────────────────────
const RequestButton = ({ status, onClick }) => {
  if (status === 'Approved') {
    return (
      <div style={{ ...reqBtn.base, ...reqBtn.approved }}>
        <CheckCircle size={13} style={{ marginRight: 6 }} /> APPROVED
      </div>
    );
  }
  if (status === 'Pending') {
    return (
      <div style={{ ...reqBtn.base, ...reqBtn.pending }}>
        <Clock size={13} style={{ marginRight: 6 }} /> PENDING
      </div>
    );
  }
  return (
    <button style={{ ...reqBtn.base, ...reqBtn.request }} onClick={onClick}>
      <UserPlus size={13} style={{ marginRight: 6 }} /> REQUEST
    </button>
  );
};

const reqBtn = {
  base: {
    display: 'inline-flex', alignItems: 'center',
    borderRadius: 6, padding: '8px 14px',
    fontSize: 12, fontWeight: 900, letterSpacing: 2,
    fontFamily: "'Barlow Condensed', sans-serif",
    cursor: 'default', border: 'none',
  },
  request: {
    background: 'rgba(255,70,85,0.15)',
    border: '1px solid rgba(255,70,85,0.35)',
    color: '#ff4655',
    cursor: 'pointer',
  },
  pending: {
    background: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.3)',
    color: '#f59e0b',
  },
  approved: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#22c55e',
  },
};

// ── Styles ────────────────────────────────────────────────
const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", color: '#ccc' },
  body: { padding: '40px 40px' },
  searchSection: { maxWidth: 700, marginBottom: 36 },
  title: { fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: 4, margin: '0 0 6px 0' },
  subtitle: { fontSize: 13, color: '#444', letterSpacing: 1, marginBottom: 20 },
  searchBar: { display: 'flex', alignItems: 'center', gap: 12, background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '14px 16px' },
  searchInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontSize: 15, letterSpacing: 1 },
  clearBtn: { background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', padding: 0 },
  resultCount: { fontSize: 11, color: '#333', letterSpacing: 2, marginTop: 10 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  empty: { gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' },
  card: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardAvatar: { width: 50, height: 50, borderRadius: '50%', border: '2px solid #1a1f2e', objectFit: 'cover' },
  cardName: { fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1 },
  cardId: { fontSize: 11, color: '#555', marginBottom: 2 },
  cardRank: { fontSize: 12, fontWeight: 700 },
  teamBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#888', letterSpacing: 1, marginBottom: 14 },
  cardStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 },
  statItem: { background: '#0a0d14', borderRadius: 6, padding: '8px', textAlign: 'center' },
  statLabel: { fontSize: 9, color: '#555', letterSpacing: 1, marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: 900, color: '#fff' },
  viewBtn: { width: '100%', background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.25)', color: '#ff4655', borderRadius: 6, padding: '8px 0', fontSize: 12, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif" },
};

const modal = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  box: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 12, width: 560, maxHeight: '85vh', overflowY: 'auto', padding: '28px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #1a1f2e' },
  avatar: { width: 56, height: 56, borderRadius: '50%', border: '2px solid #ff4655', objectFit: 'cover' },
  name: { fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  closeBtn: { background: 'transparent', border: '1px solid #1a1f2e', color: '#555', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 },
  statBox: { background: '#0a0d14', border: '1px solid #1a1f2e', borderRadius: 7, padding: '10px 12px' },
  sectionTitle: { display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 10, marginTop: 16 },
  th: { fontSize: 10, color: '#555', letterSpacing: 1, textAlign: 'left', paddingBottom: 8, fontWeight: 700 },
  td: { fontSize: 12, color: '#888', padding: '8px 0', borderBottom: '1px solid #1a1f2e' },
};

export default TeamSearchView;
