import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllPlayers } from '../services/UserApi';
import { Search, Shield, User, ChevronRight, ChevronLeft, X, UserPlus, Clock, CheckCircle } from 'lucide-react';

const loggedInUser = JSON.parse(localStorage.getItem('user'));
const userRole = localStorage.getItem('userRole'); // 'coach' or 'player'

const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('RADIANT')) return '#ffffa0';
  if (rank.includes('IMMORTAL')) return '#ff4655';
  if (rank.includes('DIAMOND')) return '#a78bfa';
  if (rank.includes('PLATINUM')) return '#38bdf8';
  return '#888';
};

const getRequestStatus = (playerName, requests = []) => {
  const found = requests.find(r => r.player?.username === playerName);
  if (!found) return 'none';
  return found.status;
};

const getRequestId = (playerName, requests = []) => {
  const found = requests.find(r => r.player?.username === playerName);
  return found?._id ?? null;
};

const PLAYERS_PER_PAGE = 8;

const TeamSearchView = () => {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedStats, setSelectedStats] = useState(null); // ← add this
  const [modalLoading, setModalLoading] = useState(false);  // ← add this
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // BUG 1 FIX: only fetch requests if logged in as coach
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/requests?coachId=${loggedInUser._id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
        setRequests([]);
      }
    };
    // BUG 1 FIX: was loggedInUser?.role === 'Coach' — now uses userRole from localStorage
    if (userRole === 'coach') fetchRequests();
  }, []);

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
    // BUG 4 FIX: only block if Pending or Approved — allow re-request after Rejection
    const status = getRequestStatus(player.username, requests);
    if (status === 'Pending' || status === 'Approved') return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/requests/${loggedInUser._id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          playerId: player._id,
          teamId: loggedInUser.teamId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to send request');
      }

      const newRequest = await res.json();

      // If a rejected request existed for this player, replace it
      setRequests(prev => {
        const filtered = prev.filter(r => r.player?.username !== player.username);
        return [
          ...filtered,
          {
            _id: newRequest._id,
            player: { username: player.username },
            team: { teamName: loggedInUser.teamName },
            status: 'Pending',
          },
        ];
      });
    } catch (err) {
      console.error('Failed to send request:', err);
    }
  };

  // get individual stats of player when user clicks on "view profile"
  const handleSelectPlayer = async (player) => {
  setSelected(player);
  setSelectedStats(null);
  setModalLoading(true);

  try {
    const res = await getPlayerStats(player._id); // already imported
    setSelectedStats(res.data);
  } catch (err) {
    console.error('Failed to fetch player stats:', err);
  } finally {
    setModalLoading(false);
  }
};

  // Filter players based on search query (CHANGED SEARCH QUERY)
  const handleCancel = async (player) => {
    try {
      const requestId = getRequestId(player.username, requests);
      if (!requestId) return;

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/requests/${requestId}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to cancel request');

      // Revert button to REQUEST state
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      console.error('Failed to cancel request:', err);
    }
  };

  const filtered = players.filter(p =>
    p.username.toLowerCase().startsWith(query.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PLAYERS_PER_PAGE));

  const paginated = filtered.slice(
    (currentPage - 1) * PLAYERS_PER_PAGE,
    currentPage * PLAYERS_PER_PAGE
  );

  const handleSearch = (value) => {
    setQuery(value);
    setCurrentPage(1);
  };

  if (loading) return <div style={{ color: '#fff', padding: 40 }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.body}>
        <div style={styles.searchSection}>
          <h1 style={styles.title}>TEAM SEARCH</h1>
          <p style={styles.subtitle}>Find players and teams across the competitive network</p>
          <div style={styles.searchBar}>
            <Search size={18} color="#555" style={{ flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by player name, Valorant ID, or team..."
              style={styles.searchInput}
              autoFocus
            />
            {query && (
              <button style={styles.clearBtn} onClick={() => handleSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div style={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>

        <div style={styles.grid}>
          {paginated.length === 0 ? (
            <div style={styles.empty}>
              <User size={40} color="#333" />
              <p style={{ color: '#444', marginTop: 12, letterSpacing: 2 }}>NO PLAYERS FOUND</p>
            </div>
          ) : (
            paginated.map(player => (
              <div
                key={player._id}
                style={styles.card}
                onClick={() => handleSelectPlayer(player)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,70,85,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1f2e'}
              >
                <div style={styles.cardTop}>
                  <img
                    src={player.imageURL || '/default-avatar.png'}
                    alt={player.username}
                    style={styles.cardAvatar}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={styles.cardName}>{player.username}</div>
                    <div style={styles.cardId}>{player.valorantId}</div>
                    <div style={{ ...styles.cardRank, color: rankColor(player.rank) }}>
                      {player.rank} · {player.rr} RR
                    </div>
                  </div>
                </div>
                <div style={styles.teamBadge}>
                  <Shield size={11} color="#ff4655" style={{ marginRight: 5 }} />
                  {player.teamId?.teamName ?? 'No Team'}
                </div>
                <div style={styles.cardStats}>
                  {[
                    { label: 'K/D', value: player.kdRatio },
                    { label: 'WIN%', value: player.winRate },
                    { label: 'ACS', value: 'N/A' }, // keep as N/A for now
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

        {totalPages > 1 && (
          <>
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageBtn,
                  borderColor: currentPage === 1 ? '#1a1f2e' : 'rgba(255,70,85,0.35)',
                  color: currentPage === 1 ? '#333' : '#ff4655',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={13} /> PREV
              </button>
              <span style={styles.pageIndicator}>{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.pageBtn,
                  borderColor: currentPage === totalPages ? '#1a1f2e' : 'rgba(255,70,85,0.35)',
                  color: currentPage === totalPages ? '#333' : '#ff4655',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                NEXT <ChevronRight size={13} />
              </button>
            </div>
            <p style={styles.pageInfo}>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PLAYERS_PER_PAGE + 1}–{Math.min(currentPage * PLAYERS_PER_PAGE, filtered.length)} of {filtered.length} players
            </p>
          </>
        )}
      </div>

      {selected && (
        <div style={modal.overlay} onClick={() => setSelected(null)}>
          <div style={modal.box} onClick={e => e.stopPropagation()}>
            <div style={modal.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={selected.imageURL || '/default-avatar.png'}
                  alt={selected.username}
                  style={modal.avatar}
                  onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                />
                <div>
                  <div style={modal.name}>{selected.username}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{selected.valorantId}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: rankColor(selected.rank), marginTop: 4 }}>
                    {selected.rank} · {selected.rr} RR
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* BUG 1 FIX: only coaches see the request button */}
                {userRole === 'coach' && (
                  <RequestButton
                    status={getRequestStatus(selected.username, requests)}
                    onClick={() => handleRequest(selected)}
                    onCancel={() => handleCancel(selected)}
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
                { label: 'WIN RATE',value: selected.winRate + '%' },
                { label: 'ACS',     value: modalLoading ? '...' : (selectedStats?.acs ?? 'N/A') },
                { label: 'HS%',     value: selected.headshotPercentage + '%' },
                { label: 'KAST',    value: modalLoading ? '...' : (selectedStats?.kast ?? 'N/A') },
                { label: 'DMG/RND', value: modalLoading ? '...' : (selectedStats?.damagePerRound ?? 'N/A') },
                { label: 'KILLS',   value: selected.stats?.kills },
                { label: 'MATCHES', value: (selected.stats?.wins ?? 0) + (selected.stats?.losses ?? 0) },
              ].map(s => (
                <div key={s.label} style={modal.statBox}>
                  <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={modal.sectionTitle}><User size={12} color="#ff4655" style={{ marginRight: 6 }} />TOP AGENTS</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr>{['AGENT', 'MATCHES', 'WIN%', 'K/D', 'ACS'].map(h => <th key={h} style={modal.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(selected.topAgents ?? []).map(a => (
                  <tr key={a.agent?.name ?? a._id}>
                    <td style={modal.td}>
                      <strong style={{ color: '#fff' }}>{a.agent?.name ?? 'Unknown'}</strong>
                    </td>
                    <td style={modal.td}>{a.matchesPlayed}</td>
                    <td style={{ ...modal.td, color: '#22c55e', fontWeight: 700 }}>
                      {a.matchesPlayed ? ((a.wins / a.matchesPlayed) * 100).toFixed(1) + '%' : '0%'}
                    </td>
                    <td style={{ ...modal.td, fontWeight: 700 }}>
                      {a.deaths === 0 ? a.kills : (a.kills / a.deaths).toFixed(2)}
                    </td>
                    <td style={{ ...modal.td, color: '#ff4655', fontWeight: 700 }}>N/A</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={modal.sectionTitle}><Shield size={12} color="#ff4655" style={{ marginRight: 6 }} />TOP MAPS</div>
            {(selected.topMaps ?? []).map(m => (
              <div key={m.map?.name ?? m._id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a1f2e', padding: '8px 0' }}>
                <span style={{ color: '#fff', fontWeight: 700, flex: 1 }}>{m.map?.name ?? 'Unknown'}</span>
                <span style={{ fontSize: 11, color: '#555', marginRight: 16 }}>{m.wins}W - {m.losses}L</span>
                <span style={{ color: '#22c55e', fontWeight: 900 }}>
                  {m.matchesPlayed ? ((m.wins / m.matchesPlayed) * 100).toFixed(1) + '%' : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RequestButton = ({ status, onClick, onCancel }) => {
  const [hovering, setHovering] = useState(false);

  if (status === 'Approved') {
    return (
      <div style={{ ...reqBtn.base, ...reqBtn.approved }}>
        <CheckCircle size={13} style={{ marginRight: 6 }} /> APPROVED
      </div>
    );
  }

  if (status === 'Pending') {
    return (
      <button
        style={{ ...reqBtn.base, ...(hovering ? reqBtn.cancel : reqBtn.pending), cursor: 'pointer' }}
        onClick={onCancel}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {hovering
          ? <><X size={13} style={{ marginRight: 6 }} /> CANCEL</>
          : <><Clock size={13} style={{ marginRight: 6 }} /> PENDING</>
        }
      </button>
    );
  }

  // status === 'none' or 'Rejected' — show REQUEST button
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
  request: { background: 'rgba(255,70,85,0.15)', border: '1px solid rgba(255,70,85,0.35)', color: '#ff4655', cursor: 'pointer' },
  pending: { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' },
  cancel: { background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.35)', color: '#ff4655' },
  approved: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' },
};

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
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 32 },
  pageBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif" },
  pageIndicator: { fontSize: 12, color: '#555', letterSpacing: 2 },
  pageInfo: { textAlign: 'center', fontSize: 11, color: '#333', letterSpacing: 1, marginTop: 10 },
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
