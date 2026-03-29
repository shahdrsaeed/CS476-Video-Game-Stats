import React, { useState, useEffect } from 'react';
import {
  Shield, User, TrendingUp, Map, X, ChevronRight,
  Users, Zap, AlertTriangle, Star, UserMinus, Check, Clock
} from 'lucide-react';
import Navbar from '../components/Navbar';

const loggedInUser = JSON.parse(localStorage.getItem('user'));

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('Radiant'))  return '#ffffa0';
  if (rank.includes('Immortal')) return '#ff4655';
  if (rank.includes('Diamond'))  return '#a78bfa';
  if (rank.includes('Platinum')) return '#38bdf8';
  return '#888';
};
const resultColor = (r) => (r === 'W' ? '#22c55e' : '#ff4655');

const pct = (v) => (v == null || v === 'N/A' ? 'N/A' : `${parseFloat(v).toFixed(1)}%`);
const winRateColor = (wr) => {
  const n = parseFloat(wr);
  if (isNaN(n)) return '#555';
  if (n >= 65)  return '#22c55e';
  if (n < 50)   return '#ff4655';
  return '#f59e0b';
};

const ALL_MAPS = ['Haven', 'Pearl', 'Bind', 'Abyss', 'Split', 'Breeze', 'Corrode'];

// ─────────────────────────────────────────────
// Adapter
// ─────────────────────────────────────────────
const adaptPlayer = (raw) => ({
  ...raw,
  id:              raw._id,
  name:            raw.username,
  avatar:          raw.imageURL || '/default-avatar.png',
  valorantId:      raw.username,
  level:           raw.level ?? 1,
  currentRank:     raw.rank ?? 'Unranked',
  rankRating:      raw.rr ?? 0,
  kdRatio:         parseFloat(raw.kdRatio ?? 0),
  winRate:         raw.winRate ?? '0.00',
  acs:             raw.stats?.acs ?? 0,
  headshotPercent: raw.headshotPercentage ?? '0.00',
  kast:            'N/A',
  damagePerRound:  'N/A',
  kills:           raw.stats?.kills   ?? 0,
  deaths:          raw.stats?.deaths  ?? 0,
  firstBloods:     raw.stats?.firstBloods ?? 0,
  matches:         (raw.stats?.wins ?? 0) + (raw.stats?.losses ?? 0),
  roles:           raw.roles ?? [],
  topAgents: (raw.topAgents ?? []).map(a => ({
    name:    a.agent?.name   ?? 'Unknown',
    role:    a.agent?.role   ?? '',
    matches: a.matchesPlayed ?? 0,
    winRate: a.matchesPlayed ? ((a.wins / a.matchesPlayed) * 100).toFixed(1) + '%' : '0%',
    kd:      a.deaths === 0  ? a.kills : (a.kills / a.deaths).toFixed(2),
    acs:     'N/A',
  })),
  topMaps: (raw.topMaps ?? []).map(m => ({
    map:     m.map?.name ?? 'Unknown',
    wins:    m.wins      ?? 0,
    losses:  m.losses    ?? 0,
    played:  m.matchesPlayed ?? 0,
    winRate: m.matchesPlayed ? ((m.wins / m.matchesPlayed) * 100).toFixed(1) : '0',
  })),
  recentMatches: (raw.last20Matches ?? []).map(m => ({
    map:       m.match?.map       ?? 'N/A',
    result:    m.result === 'Win' ? 'W' : 'L',
    score:     m.match?.score     ?? 'N/A',
    kd:        m.match?.kd        ?? 0,
    kda:       m.match?.kda       ?? 'N/A',
    acs:       m.match?.acs       ?? 0,
    placement: m.match?.placement ?? 'N/A',
  })),
});

// ─────────────────────────────────────────────
// Map Performance Table
// Rows = players, Columns = maps, + overall avg
// ─────────────────────────────────────────────
const MapPerformanceTable = ({ players }) => {
  // Only show maps where at least one player has data
  const activeMaps = ALL_MAPS.filter(mapName =>
    players.some(p => p.topMaps.find(m => m.map === mapName && m.played > 0))
  );

  if (activeMaps.length === 0) {
    return (
      <div style={{ color: '#444', fontSize: 12, padding: '20px 0', letterSpacing: 1 }}>
        No map data available yet — stats will appear after matches are played.
      </div>
    );
  }

  // Team-average win rate per map
  const teamAvg = (mapName) => {
    const entries = players.map(p => p.topMaps.find(m => m.map === mapName)).filter(Boolean).filter(m => m.played > 0);
    if (entries.length === 0) return null;
    return (entries.reduce((s, m) => s + parseFloat(m.winRate), 0) / entries.length).toFixed(1);
  };

  // Overall win rate across all maps for a player
  const playerOverall = (player) => {
    const maps = player.topMaps.filter(m => m.played > 0);
    if (maps.length === 0) return null;
    const totalWins    = maps.reduce((s, m) => s + m.wins, 0);
    const totalPlayed  = maps.reduce((s, m) => s + m.played, 0);
    return totalPlayed ? ((totalWins / totalPlayed) * 100).toFixed(1) : null;
  };

  // Cell — win rate with color + W-L breakdown on hover via title
  const Cell = ({ mapData }) => {
    if (!mapData || mapData.played === 0) {
      return <td style={tbl.cell}><span style={{ color: '#333', fontSize: 11 }}>—</span></td>;
    }
    const wr = parseFloat(mapData.winRate);
    return (
      <td style={tbl.cell} title={`${mapData.wins}W – ${mapData.losses}L (${mapData.played} played)`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontWeight: 900, color: winRateColor(wr), fontSize: 14 }}>{mapData.winRate}%</span>
          <span style={{ fontSize: 9, color: '#444', letterSpacing: 0.5 }}>{mapData.wins}W–{mapData.losses}L</span>
        </div>
      </td>
    );
  };

  const AvgCell = ({ value }) => {
    if (value == null) return <td style={{ ...tbl.cell, ...tbl.avgCol }}><span style={{ color: '#333' }}>—</span></td>;
    return (
      <td style={{ ...tbl.cell, ...tbl.avgCol }}>
        <span style={{ fontWeight: 900, color: winRateColor(value), fontSize: 14 }}>{value}%</span>
      </td>
    );
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tbl.table}>
        <thead>
          <tr>
            <th style={{ ...tbl.th, ...tbl.playerCol, textAlign: 'left' }}>PLAYER</th>
            {activeMaps.map(m => (
              <th key={m} style={tbl.th}>{m.toUpperCase()}</th>
            ))}
            <th style={{ ...tbl.th, ...tbl.avgCol }}>OVERALL</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id} style={tbl.row}
              onMouseEnter={e => (e.currentTarget.style.background = '#111520')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Player identity */}
              <td style={{ ...tbl.cell, ...tbl.playerCol, textAlign: 'left', minWidth: 160 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={player.avatar} alt={player.name} style={tbl.avatar}
                    onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
                  <div>
                    <div style={{ fontWeight: 900, color: '#fff', fontSize: 13 }}>{player.name}</div>
                    <div style={{ fontSize: 10, color: rankColor(player.currentRank) }}>{player.currentRank}</div>
                  </div>
                </div>
              </td>

              {/* Per-map win rates */}
              {activeMaps.map(mapName => (
                <Cell key={mapName} mapData={player.topMaps.find(m => m.map === mapName)} />
              ))}

              {/* Overall */}
              <AvgCell value={playerOverall(player)} />
            </tr>
          ))}

          {/* Team average row */}
          <tr style={{ ...tbl.row, background: '#0a0d14', borderTop: '2px solid #1a1f2e' }}>
            <td style={{ ...tbl.cell, ...tbl.playerCol, textAlign: 'left' }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#555', letterSpacing: 2 }}>TEAM AVG</span>
            </td>
            {activeMaps.map(mapName => {
              const avg = teamAvg(mapName);
              return (
                <td key={mapName} style={{ ...tbl.cell, background: '#0a0d14' }}>
                  {avg != null
                    ? <span style={{ fontWeight: 900, color: winRateColor(avg), fontSize: 14 }}>{avg}%</span>
                    : <span style={{ color: '#333' }}>—</span>}
                </td>
              );
            })}
            {/* Team overall */}
            {(() => {
              const all = players.flatMap(p => p.topMaps.filter(m => m.played > 0));
              if (all.length === 0) return <td style={{ ...tbl.cell, ...tbl.avgCol, background: '#0a0d14' }}><span style={{ color: '#333' }}>—</span></td>;
              const tw = all.reduce((s, m) => s + m.wins, 0);
              const tp = all.reduce((s, m) => s + m.played, 0);
              const overall = tp ? ((tw / tp) * 100).toFixed(1) : null;
              return (
                <td style={{ ...tbl.cell, ...tbl.avgCol, background: '#0a0d14' }}>
                  {overall ? <span style={{ fontWeight: 900, color: winRateColor(overall), fontSize: 14 }}>{overall}%</span> : '—'}
                </td>
              );
            })()}
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 10, color: '#333', letterSpacing: 1, marginTop: 8 }}>
        Hover over a cell to see W–L record and games played · Color: <span style={{ color: '#22c55e' }}>≥65%</span> strong · <span style={{ color: '#f59e0b' }}>50–64%</span> average · <span style={{ color: '#ff4655' }}>{'<50%'}</span> weak
      </p>
    </div>
  );
};

const tbl = {
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { fontSize: 10, color: '#555', letterSpacing: 2, textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #1a1f2e', fontWeight: 700, background: '#0a0d14', whiteSpace: 'nowrap' },
  cell:      { padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #0f1117', color: '#888', transition: 'background 0.15s' },
  row:       { cursor: 'default', transition: 'background 0.15s' },
  playerCol: { paddingLeft: 16 },
  avgCol:    { background: 'rgba(255,70,85,0.03)', borderLeft: '1px solid #1a1f2e' },
  avatar:    { width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1a1f2e', flexShrink: 0 },
};

// ─────────────────────────────────────────────
// AI advice
// ─────────────────────────────────────────────
const generateAdvice = (player) => {
  const advice = { weaknesses: [], mapAdvice: [], composition: [], verdict: '' };
  if (parseFloat(player.headshotPercent) < 30)
    advice.weaknesses.push(`Low headshot % (${pct(player.headshotPercent)}) — needs aim training.`);
  if (player.kdRatio < 1.2)
    advice.weaknesses.push(`K/D of ${player.kdRatio} is below carry threshold — review positioning.`);
  const weak   = player.topMaps.filter(m => parseFloat(m.winRate) < 50);
  const strong = player.topMaps.filter(m => parseFloat(m.winRate) >= 65);
  if (weak.length)   advice.mapAdvice.push(`Struggles on: ${weak.map(m => m.map).join(', ')}`);
  if (strong.length) advice.mapAdvice.push(`Strong on: ${strong.map(m => m.map).join(', ')}`);
  if (player.topAgents.length > 0)
    advice.composition.push(`${player.topAgents[0].name} is their signature agent.`);
  if (player.kdRatio >= 1.4 && parseFloat(player.winRate) >= 65) advice.verdict = 'PROMOTE';
  else if (player.kdRatio < 1.1 || parseFloat(player.winRate) < 55) advice.verdict = 'BENCH';
  else advice.verdict = 'KEEP';
  return advice;
};

// ─────────────────────────────────────────────
// AI Modal
// ─────────────────────────────────────────────
const AIModal = ({ player, onClose }) => {
  const advice = generateAdvice(player);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);
  const vs = { PROMOTE: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' }, BENCH: { color: '#ff4655', bg: 'rgba(255,70,85,0.1)', border: 'rgba(255,70,85,0.3)' }, KEEP: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' } }[advice.verdict];
  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.box} onClick={e => e.stopPropagation()}>
        <div style={modal.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={player.avatar} alt={player.name} style={modal.avatar} onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
            <div>
              <div style={modal.playerName}>{player.name}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{player.currentRank} · {player.rankRating} RR</div>
            </div>
            <div style={{ ...modal.verdictBadge, color: vs.color, background: vs.bg, border: `1px solid ${vs.border}` }}>
              {advice.verdict === 'PROMOTE' ? <Star size={12} style={{ marginRight: 5 }} /> : advice.verdict === 'BENCH' ? <AlertTriangle size={12} style={{ marginRight: 5 }} /> : <Zap size={12} style={{ marginRight: 5 }} />}
              {advice.verdict}
            </div>
          </div>
          <button style={modal.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        {loading ? (
          <div style={modal.loading}><div style={modal.spinner} /><span style={{ color: '#555', fontSize: 13, letterSpacing: 2 }}>ANALYZING...</span></div>
        ) : (
          <div style={modal.body}>
            <ModalSection icon={<AlertTriangle size={13} color="#ff4655" />} title="WEAKNESSES">
              {advice.weaknesses.length > 0 ? advice.weaknesses.map((w, i) => <AdviceItem key={i} text={w} color="#ff4655" />) : <AdviceItem text="No significant weaknesses detected." color="#22c55e" />}
            </ModalSection>
            <ModalSection icon={<Map size={13} color="#38bdf8" />} title="MAP ANALYSIS">
              {advice.mapAdvice.length > 0 ? advice.mapAdvice.map((m, i) => <AdviceItem key={i} text={m} color="#38bdf8" />) : <AdviceItem text="Not enough map data yet." color="#555" />}
            </ModalSection>
            <ModalSection icon={<Users size={13} color="#a78bfa" />} title="COMPOSITION">
              {advice.composition.length > 0 ? advice.composition.map((c, i) => <AdviceItem key={i} text={c} color="#a78bfa" />) : <AdviceItem text="No agent data available." color="#555" />}
            </ModalSection>
          </div>
        )}
      </div>
    </div>
  );
};
const ModalSection = ({ icon, title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 10 }}>{icon}{title}</div>
    {children}
  </div>
);
const AdviceItem = ({ text, color }) => (
  <div style={{ display: 'flex', gap: 10, marginBottom: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1f2e', borderRadius: 6, padding: '10px 12px' }}>
    <ChevronRight size={14} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
    <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{text}</span>
  </div>
);

// ─────────────────────────────────────────────
// Player Detail Panel (with remove button)
// ─────────────────────────────────────────────
const PlayerDetailPanel = ({ player, onClose, onAdvice, onRemove }) => (
  <div style={detail.overlay} onClick={onClose}>
    <div style={detail.panel} onClick={e => e.stopPropagation()}>
      <div style={detail.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={player.avatar} alt={player.name} style={detail.avatar} onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
          <div>
            <div style={detail.name}>{player.name}</div>
            <div style={{ fontSize: 12, color: '#555' }}>{player.valorantId}</div>
            <div style={{ fontSize: 13, color: rankColor(player.currentRank), fontWeight: 900, marginTop: 4 }}>
              {player.currentRank} · {player.rankRating} RR
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <button style={detail.aiBtn} onClick={() => onAdvice(player)}><Zap size={14} style={{ marginRight: 6 }} />AI ADVICE</button>
          <button style={detail.removeBtn} onClick={() => onRemove(player)} title="Remove from roster"><UserMinus size={14} /></button>
          <button style={detail.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
      </div>
      <div style={detail.statsGrid}>
        {[
          { label: 'K/D', value: player.kdRatio }, { label: 'WIN RATE', value: player.winRate + '%' },
          { label: 'ACS', value: player.acs },      { label: 'HS%', value: pct(player.headshotPercent) },
          { label: 'KAST', value: player.kast },    { label: 'DMG/RND', value: player.damagePerRound },
          { label: 'KILLS', value: player.kills },  { label: 'DEATHS', value: player.deaths },
        ].map(s => (
          <div key={s.label} style={detail.statBox}>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={detail.sectionTitle}><User size={12} color="#ff4655" style={{ marginRight: 6 }} />TOP AGENTS</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead><tr>{['AGENT','MATCHES','WIN%','K/D','ACS'].map(h => <th key={h} style={detail.th}>{h}</th>)}</tr></thead>
        <tbody>
          {player.topAgents.map(a => (
            <tr key={a.name}>
              <td style={detail.td}><strong style={{ color: '#fff' }}>{a.name}</strong><div style={{ fontSize: 10, color: '#555' }}>{a.role}</div></td>
              <td style={detail.td}>{a.matches}</td>
              <td style={{ ...detail.td, color: '#22c55e', fontWeight: 700 }}>{a.winRate}</td>
              <td style={{ ...detail.td, fontWeight: 700 }}>{a.kd}</td>
              <td style={{ ...detail.td, color: '#ff4655', fontWeight: 700 }}>{a.acs}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={detail.sectionTitle}><TrendingUp size={12} color="#ff4655" style={{ marginRight: 6 }} />RECENT MATCHES</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{['MAP','RESULT','SCORE','K/D','K/D/A','ACS','PLACE'].map(h => <th key={h} style={detail.th}>{h}</th>)}</tr></thead>
        <tbody>
          {player.recentMatches.map((m, i) => (
            <tr key={i}>
              <td style={{ ...detail.td, color: '#fff', fontWeight: 700 }}>{m.map}</td>
              <td style={{ ...detail.td, color: resultColor(m.result), fontWeight: 900 }}>{m.result}</td>
              <td style={detail.td}>{m.score}</td>
              <td style={{ ...detail.td, fontWeight: 700, color: m.kd >= 1.5 ? '#22c55e' : m.kd < 1 ? '#ff4655' : '#fff' }}>{m.kd}</td>
              <td style={detail.td}>{m.kda}</td>
              <td style={{ ...detail.td, color: '#ff4655', fontWeight: 700 }}>{m.acs}</td>
              <td style={{ ...detail.td, color: m.placement === 'MVP' ? '#ffffa0' : '#888', fontWeight: 700 }}>{m.placement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Confirm Remove Modal
// ─────────────────────────────────────────────
const ConfirmRemoveModal = ({ player, onConfirm, onCancel }) => (
  <div style={modal.overlay} onClick={onCancel}>
    <div style={{ ...modal.box, width: 420, padding: '32px 28px' }} onClick={e => e.stopPropagation()}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.25)', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <UserMinus size={22} color="#ff4655" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1, marginBottom: 8 }}>Remove Player</div>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
          Remove <span style={{ color: '#fff', fontWeight: 700 }}>{player.name}</span> from your roster?
          <br />This will unlink them from your team.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={removeModal.cancelBtn} onClick={onCancel}>CANCEL</button>
        <button style={removeModal.confirmBtn} onClick={() => onConfirm(player)}>REMOVE</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Coach Dashboard
// ─────────────────────────────────────────────
const CoachDashboardView = () => {
  const [players,        setPlayers]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [advicePlayer,   setAdvicePlayer]   = useState(null);
  const [removeTarget,   setRemoveTarget]   = useState(null);
  const [removeError,    setRemoveError]    = useState(null);

  // ── Fetch roster ──────────────────────────────────────────
  const fetchRoster = async () => {
    try {
      const teamId = loggedInUser?.teamId;
      if (!teamId) { setLoading(false); return; }
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/teams/${teamId}/players`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch roster');
      const data = await res.json();
      setPlayers(data.map(adaptPlayer));
    } catch (err) {
      console.error('Failed to fetch roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoster(); }, []);

  // ── Remove player ──────────────────────────────────────────
  const handleRemoveClick   = (player) => { setSelectedPlayer(null); setRemoveTarget(player); setRemoveError(null); };
  const handleRemoveConfirm = async (player) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/players/${player._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coach: null }),
      });
      setPlayers(prev => prev.filter(p => p._id !== player._id));
      setRemoveTarget(null);
    } catch (err) {
      setRemoveError(`Could not remove player: ${err.message}`);
    }
  };

  // ── Team averages ──────────────────────────────────────────
  const avg = (key) => players.length === 0 ? 'N/A'
    : (players.reduce((s, p) => s + (parseFloat(p[key]) || 0), 0) / players.length).toFixed(2);
  const avgWin = players.length === 0 ? 'N/A'
    : (players.reduce((s, p) => s + parseFloat(p.winRate ?? 0), 0) / players.length).toFixed(1) + '%';
  const totalMatches = players.reduce((s, p) => s + (p.matches || 0), 0);

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* ── COACH BANNER ── */}
        <div style={styles.banner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img src={loggedInUser?.imageURL || '/default-avatar.png'} alt={loggedInUser?.username} style={styles.bannerAvatar}
              onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
            <div>
              <div style={styles.bannerName}>{loggedInUser?.username ?? 'Coach'}</div>
              <div style={{ fontSize: 12, color: '#555', letterSpacing: 1, marginBottom: 8 }}>{loggedInUser?.title ?? 'Head Coach'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={styles.badge}><Shield size={11} style={{ marginRight: 4 }} />{loggedInUser?.teamId ? 'Team Assigned' : 'No Team Yet'}</span>
                <span style={styles.badge}><Users size={11} style={{ marginRight: 4 }} />{players.length} PLAYERS</span>
              </div>
            </div>
          </div>
          <div style={styles.teamStats}>
            {[
              { label: 'AVG K/D',       value: avg('kdRatio') },
              { label: 'AVG WIN RATE',  value: avgWin },
              { label: 'AVG ACS',       value: avg('acs') },
              { label: 'TOTAL MATCHES', value: totalMatches },
            ].map(s => (
              <div key={s.label} style={styles.teamStatBox}>
                <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROSTER TABLE ── */}
        <div style={styles.sectionTitle}>
          <Users size={13} color="#ff4655" style={{ marginRight: 8 }} />TEAM ROSTER
          <span style={{ fontSize: 11, color: '#333', marginLeft: 10 }}>Click a player to view details, AI advice, or remove them</span>
        </div>
        <div style={styles.tableCard}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 13, letterSpacing: 2 }}>LOADING ROSTER...</div>
          ) : players.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#333', fontSize: 13, letterSpacing: 2 }}>
              NO PLAYERS ON YOUR ROSTER YET — send requests from Team Search to recruit players
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>{['PLAYER','RANK','K/D','WIN RATE','ACS','HS%','KAST','DMG/RND','MATCHES','ACTION'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id} style={styles.tr}
                    onMouseEnter={e => (e.currentTarget.style.background = '#141820')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={player.avatar} alt={player.name} style={styles.rowAvatar} onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
                        <div>
                          <div style={{ fontWeight: 900, color: '#fff', fontSize: 14 }}>{player.name}</div>
                          <div style={{ fontSize: 10, color: '#555' }}>LVL {player.level}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: rankColor(player.currentRank), fontWeight: 900, fontSize: 13 }}>{player.currentRank}</span>
                      <div style={{ fontSize: 10, color: '#555' }}>{player.rankRating} RR</div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 900, fontSize: 15, color: player.kdRatio >= 1.4 ? '#22c55e' : player.kdRatio < 1.1 ? '#ff4655' : '#fff' }}>
                      {player.kdRatio}
                    </td>
                    <td style={styles.td}><span style={styles.winRateBadge}>{player.winRate}%</span></td>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#ff4655' }}>{player.acs}</td>
                    <td style={styles.td}>{pct(player.headshotPercent)}</td>
                    <td style={styles.td}>{player.kast}</td>
                    <td style={styles.td}>{player.damagePerRound}</td>
                    <td style={styles.td}>{player.matches}</td>
                    <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={styles.detailBtn} onClick={e => { e.stopPropagation(); setSelectedPlayer(player); }}>
                          VIEW <ChevronRight size={12} />
                        </button>
                        <button style={styles.removeBtn} onClick={e => { e.stopPropagation(); handleRemoveClick(player); }} title="Remove from roster">
                          <UserMinus size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MAP PERFORMANCE TABLE (replaces the old card grid) ── */}
        {players.length > 0 && (
          <>
            <div style={styles.sectionTitle}>
              <Map size={13} color="#ff4655" style={{ marginRight: 8 }} />TEAM MAP PERFORMANCE
              <span style={{ fontSize: 11, color: '#333', marginLeft: 10 }}>Win rate per player per map — updates as roster changes</span>
            </div>
            <div style={styles.tableCard}>
              <MapPerformanceTable players={players} />
            </div>
          </>
        )}

      </div>

      {selectedPlayer && (
        <PlayerDetailPanel
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onAdvice={p => { setAdvicePlayer(p); setSelectedPlayer(null); }}
          onRemove={handleRemoveClick}
        />
      )}
      {advicePlayer && <AIModal player={advicePlayer} onClose={() => setAdvicePlayer(null)} />}
      {removeTarget  && <ConfirmRemoveModal player={removeTarget} onConfirm={handleRemoveConfirm} onCancel={() => { setRemoveTarget(null); setRemoveError(null); }} />}
      {removeError && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1a0a0d', border: '1px solid rgba(255,70,85,0.4)', color: '#ff4655', padding: '10px 20px', borderRadius: 8, fontSize: 12, zIndex: 300 }}>
          ⚠ {removeError}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = {
  page:         { minHeight: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed','Arial Narrow',sans-serif", color: '#ccc' },
  body:         { padding: '28px 40px' },
  banner:       { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  bannerAvatar: { width: 68, height: 68, borderRadius: '50%', border: '3px solid #ff4655', objectFit: 'cover' },
  bannerName:   { fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  badge:        { display: 'inline-flex', alignItems: 'center', background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#888', letterSpacing: 1 },
  teamStats:    { display: 'flex', gap: 20 },
  teamStatBox:  { background: '#0a0d14', border: '1px solid #1a1f2e', borderRadius: 8, padding: '12px 20px', textAlign: 'center', minWidth: 100 },
  sectionTitle: { display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 12, marginTop: 8 },
  tableCard:    { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, overflow: 'hidden', marginBottom: 28 },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { fontSize: 10, color: '#555', letterSpacing: 2, textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid #1a1f2e', fontWeight: 700, background: '#0a0d14' },
  td:           { fontSize: 13, color: '#888', padding: '14px 16px', borderBottom: '1px solid #0f1117' },
  tr:           { cursor: 'pointer', transition: 'background 0.15s' },
  rowAvatar:    { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1a1f2e' },
  winRateBadge: { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 4, padding: '3px 8px', fontWeight: 700, fontSize: 12 },
  detailBtn:    { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.25)', color: '#ff4655', borderRadius: 5, padding: '5px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif" },
  removeBtn:    { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,70,85,0.06)', border: '1px solid rgba(255,70,85,0.18)', color: '#ff4655', borderRadius: 5, padding: '5px 8px', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.15s' },
};

const detail = {
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' },
  panel:        { width: 520, background: '#0f1117', borderLeft: '1px solid #1a1f2e', height: '100vh', overflowY: 'auto', padding: '24px 28px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  avatar:       { width: 56, height: 56, borderRadius: '50%', border: '2px solid #ff4655', objectFit: 'cover' },
  name:         { fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  aiBtn:        { display: 'inline-flex', alignItems: 'center', background: 'rgba(255,70,85,0.15)', border: '1px solid rgba(255,70,85,0.3)', color: '#ff4655', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif" },
  removeBtn:    { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.2)', color: '#ff4655', borderRadius: 6, padding: '7px 10px', cursor: 'pointer' },
  closeBtn:     { background: 'transparent', border: '1px solid #1a1f2e', color: '#555', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 },
  statBox:      { background: '#0a0d14', border: '1px solid #1a1f2e', borderRadius: 7, padding: '10px 12px' },
  sectionTitle: { display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 10 },
  th:           { fontSize: 10, color: '#555', letterSpacing: 1, textAlign: 'left', paddingBottom: 8, fontWeight: 700 },
  td:           { fontSize: 12, color: '#888', padding: '8px 0', borderBottom: '1px solid #1a1f2e' },
};

const modal = {
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  box:          { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 12, width: 580, maxHeight: '85vh', overflowY: 'auto', padding: '28px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #1a1f2e' },
  avatar:       { width: 48, height: 48, borderRadius: '50%', border: '2px solid #ff4655', objectFit: 'cover' },
  playerName:   { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  verdictBadge: { display: 'inline-flex', alignItems: 'center', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 900, letterSpacing: 2, marginLeft: 12 },
  closeBtn:     { background: 'transparent', border: '1px solid #1a1f2e', color: '#555', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex' },
  body:         { display: 'flex', flexDirection: 'column' },
  loading:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0' },
  spinner:      { width: 32, height: 32, border: '3px solid #1a1f2e', borderTop: '3px solid #ff4655', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

const removeModal = {
  cancelBtn:  { flex: 1, background: 'transparent', border: '1px solid #1a1f2e', color: '#666', borderRadius: 7, padding: 11, fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif" },
  confirmBtn: { flex: 1, background: 'rgba(255,70,85,0.12)', border: '1px solid rgba(255,70,85,0.35)', color: '#ff4655', borderRadius: 7, padding: 11, fontSize: 13, fontWeight: 900, letterSpacing: 1, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif" },
};

export default CoachDashboardView;
