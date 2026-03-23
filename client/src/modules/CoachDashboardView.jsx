import React, { useState } from 'react';
import { Shield, User, TrendingUp, Map, X, ChevronRight, Users, Crosshair, Target, Zap, AlertTriangle, Star } from 'lucide-react';
import { PLAYERS_LIST, COACH_DATA } from '../data/mockData';
import Navbar from '../components/Navbar'

// ── helpers ──────────────────────────────────────────────
const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('RADIANT'))  return '#ffffa0';
  if (rank.includes('IMMORTAL')) return '#ff4655';
  if (rank.includes('DIAMOND'))  return '#a78bfa';
  if (rank.includes('PLATINUM')) return '#38bdf8';
  return '#888';
};

const resultColor = (r) => (r === 'W' ? '#22c55e' : '#ff4655');

// ── AI advice generator (uses mockData, no real API needed) ──
const generateAdvice = (player) => {
  const advice = { weaknesses: [], mapAdvice: [], composition: [], verdict: '' };

  // Individual weaknesses
  if (parseFloat(player.headshotPercent) < 30)
    advice.weaknesses.push(`Low headshot % (${player.headshotPercent}) — needs aim training, especially flick shots.`);
  if (player.kdRatio < 1.2)
    advice.weaknesses.push(`K/D of ${player.kdRatio} is below carry threshold — review positioning and aggression timing.`);
  if (parseFloat(player.kast) < 72)
    advice.weaknesses.push(`KAST of ${player.kast} suggests inconsistency — focus on trade frags and utility usage.`);
  if (player.firstBloods < 400)
    advice.weaknesses.push(`Only ${player.firstBloods} first bloods — passive entry fragging style, may be a liability on attack.`);

  // Map advice
  const weakMaps = player.topMaps.filter(m => parseFloat(m.winRate) < 60);
  const strongMaps = player.topMaps.filter(m => parseFloat(m.winRate) >= 65);
  if (weakMaps.length > 0)
    advice.mapAdvice.push(`Struggles on: ${weakMaps.map(m => m.map).join(', ')} — consider banning these in scrims.`);
  if (strongMaps.length > 0)
    advice.mapAdvice.push(`Strong on: ${strongMaps.map(m => m.map).join(', ')} — prioritize these in competitive play.`);

  // Composition / role advice
  const bestRole = player.roles.reduce((a, b) => parseFloat(a.winRate) > parseFloat(b.winRate) ? a : b);
  const worstRole = player.roles.reduce((a, b) => parseFloat(a.winRate) < parseFloat(b.winRate) ? a : b);
  advice.composition.push(`Best fit as ${bestRole.role} (${bestRole.winRate} win rate) — deploy here for max impact.`);
  if (player.roles.length > 1)
    advice.composition.push(`Avoid forcing ${worstRole.role} role (${worstRole.winRate} win rate) unless necessary.`);

  const topAgent = player.topAgents[0];
  advice.composition.push(`${topAgent.name} is their signature agent — build strategies around it.`);

  // Bench/promote verdict
  if (player.kdRatio >= 1.4 && parseFloat(player.winRate) >= 65) {
    advice.verdict = 'PROMOTE';
  } else if (player.kdRatio < 1.1 || parseFloat(player.winRate) < 55) {
    advice.verdict = 'BENCH';
  } else {
    advice.verdict = 'KEEP';
  }

  return advice;
};

// ── AI Modal ─────────────────────────────────────────────
const AIModal = ({ player, onClose }) => {
  const advice = generateAdvice(player);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const verdictStyle = {
    PROMOTE: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
    BENCH:   { color: '#ff4655', bg: 'rgba(255,70,85,0.1)',  border: 'rgba(255,70,85,0.3)' },
    KEEP:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  }[advice.verdict];

  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.box} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={modal.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={player.avatar} alt={player.name} style={modal.avatar} />
            <div>
              <div style={modal.playerName}>{player.name}</div>
              <div style={{ fontSize: 12, color: '#555', letterSpacing: 1 }}>{player.valorantId}</div>
            </div>
            <div style={{ ...modal.verdictBadge, color: verdictStyle.color, background: verdictStyle.bg, border: `1px solid ${verdictStyle.border}` }}>
              {advice.verdict === 'PROMOTE' ? <Star size={12} style={{ marginRight: 5 }} /> : advice.verdict === 'BENCH' ? <AlertTriangle size={12} style={{ marginRight: 5 }} /> : <Zap size={12} style={{ marginRight: 5 }} />}
              {advice.verdict}
            </div>
          </div>
          <button style={modal.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {loading ? (
          <div style={modal.loading}>
            <div style={modal.spinner} />
            <span style={{ color: '#555', fontSize: 13, letterSpacing: 2 }}>ANALYZING PLAYER DATA...</span>
          </div>
        ) : (
          <div style={modal.body}>

            {/* Weaknesses */}
            <Section icon={<AlertTriangle size={13} color="#ff4655" />} title="INDIVIDUAL WEAKNESSES">
              {advice.weaknesses.length > 0
                ? advice.weaknesses.map((w, i) => <AdviceItem key={i} text={w} color="#ff4655" />)
                : <AdviceItem text="No significant weaknesses detected — player is performing well across all metrics." color="#22c55e" />}
            </Section>

            {/* Map advice */}
            <Section icon={<Map size={13} color="#38bdf8" />} title="MAP ANALYSIS">
              {advice.mapAdvice.map((m, i) => <AdviceItem key={i} text={m} color="#38bdf8" />)}
            </Section>

            {/* Composition */}
            <Section icon={<Users size={13} color="#a78bfa" />} title="TEAM COMPOSITION">
              {advice.composition.map((c, i) => <AdviceItem key={i} text={c} color="#a78bfa" />)}
            </Section>

          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ icon, title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 10 }}>
      {icon}{title}
    </div>
    {children}
  </div>
);

const AdviceItem = ({ text, color }) => (
  <div style={{ display: 'flex', gap: 10, marginBottom: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1f2e', borderRadius: 6, padding: '10px 12px' }}>
    <ChevronRight size={14} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
    <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{text}</span>
  </div>
);

// ── Player Detail Panel ───────────────────────────────────
const PlayerDetailPanel = ({ player, onClose, onAdvice }) => (
  <div style={detail.overlay} onClick={onClose}>
    <div style={detail.panel} onClick={e => e.stopPropagation()}>
      <div style={detail.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={player.avatar} alt={player.name} style={detail.avatar} />
          <div>
            <div style={detail.name}>{player.name}</div>
            <div style={{ fontSize: 12, color: '#555' }}>{player.valorantId}</div>
            <div style={{ fontSize: 13, color: rankColor(player.currentRank), fontWeight: 900, marginTop: 4 }}>
              {player.currentRank} · {player.rankRating} RR
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={detail.aiBtn} onClick={() => onAdvice(player)}>
            <Zap size={14} style={{ marginRight: 6 }} /> AI ADVICE
          </button>
          <button style={detail.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
      </div>

      {/* Key stats */}
      <div style={detail.statsGrid}>
        {[
          { label: 'K/D', value: player.kdRatio },
          { label: 'WIN RATE', value: player.winRate },
          { label: 'ACS', value: player.acs },
          { label: 'HS%', value: player.headshotPercent },
          { label: 'KAST', value: player.kast },
          { label: 'DMG/RND', value: player.damagePerRound },
          { label: 'KILLS', value: player.kills },
          { label: 'DEATHS', value: player.deaths },
        ].map(s => (
          <div key={s.label} style={detail.statBox}>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Top agents */}
      <div style={detail.sectionTitle}><User size={12} color="#ff4655" style={{ marginRight: 6 }} />TOP AGENTS</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr>{['AGENT', 'MATCHES', 'WIN%', 'K/D', 'ACS'].map(h => <th key={h} style={detail.th}>{h}</th>)}</tr>
        </thead>
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

      {/* Recent matches */}
      <div style={detail.sectionTitle}><TrendingUp size={12} color="#ff4655" style={{ marginRight: 6 }} />RECENT MATCHES</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{['MAP', 'RESULT', 'SCORE', 'K/D', 'K/D/A', 'ACS', 'PLACE'].map(h => <th key={h} style={detail.th}>{h}</th>)}</tr>
        </thead>
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

// ── Main Coach Dashboard ──────────────────────────────────
const CoachDashboardView = () => {
  const coach = COACH_DATA;
  const players = PLAYERS_LIST;
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [advicePlayer, setAdvicePlayer]     = useState(null);

  // Team averages
  const avg = (key) => (players.reduce((s, p) => s + p[key], 0) / players.length).toFixed(2);
  const avgWin = (players.reduce((s, p) => s + parseFloat(p.winRate), 0) / players.length).toFixed(1) + '%';

  return (
    <div style={styles.page}>

      {/* ── HEADER ── */}
      <Navbar  />

      <div style={styles.body}>

        {/* ── COACH BANNER ── */}
        <div style={styles.banner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img src={coach.avatar} alt={coach.name} style={styles.bannerAvatar} />
            <div>
              <div style={styles.bannerName}>{coach.name}</div>
              <div style={{ fontSize: 12, color: '#555', letterSpacing: 1, marginBottom: 8 }}>{coach.role}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={styles.badge}><Shield size={11} style={{ marginRight: 4 }} />{coach.team}</span>
                <span style={styles.badge}><Users size={11} style={{ marginRight: 4 }} />{players.length} PLAYERS</span>
              </div>
            </div>
          </div>
          {/* Team summary stats */}
          <div style={styles.teamStats}>
            {[
              { label: 'AVG K/D', value: avg('kdRatio') },
              { label: 'AVG WIN RATE', value: avgWin },
              { label: 'AVG ACS', value: avg('acs') },
              { label: 'TOTAL MATCHES', value: players.reduce((s, p) => s + p.matches, 0) },
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
          <span style={{ fontSize: 11, color: '#333', marginLeft: 10 }}>Click a player to view full details & AI advice</span>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['PLAYER', 'RANK', 'K/D', 'WIN RATE', 'ACS', 'HS%', 'KAST', 'DMG/RND', 'MATCHES', 'ACTION'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr
                  key={player.id}
                  style={styles.tr}
                  onMouseEnter={e => e.currentTarget.style.background = '#141820'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setSelectedPlayer(player)}
                >
                  {/* Player identity */}
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={player.avatar} alt={player.name} style={styles.rowAvatar} />
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
                  <td style={{ ...styles.td, fontWeight: 900, color: player.kdRatio >= 1.4 ? '#22c55e' : player.kdRatio < 1.1 ? '#ff4655' : '#fff', fontSize: 15 }}>
                    {player.kdRatio}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.winRateBadge}>{player.winRate}</span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#ff4655' }}>{player.acs}</td>
                  <td style={styles.td}>{player.headshotPercent}</td>
                  <td style={styles.td}>{player.kast}</td>
                  <td style={styles.td}>{player.damagePerRound}</td>
                  <td style={styles.td}>{player.matches}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.detailBtn}
                      onClick={e => { e.stopPropagation(); setSelectedPlayer(player); }}
                    >
                      VIEW <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TEAM MAP OVERVIEW ── */}
        <div style={styles.sectionTitle}><Map size={13} color="#ff4655" style={{ marginRight: 8 }} />TEAM MAP PERFORMANCE</div>
        <div style={styles.mapGrid}>
          {['Haven', 'Pearl', 'Bind', 'Abyss', 'Split', 'Breeze'].map(mapName => {
            const mapStats = players.map(p => p.topMaps.find(m => m.map === mapName)).filter(Boolean);
            if (mapStats.length === 0) return null;
            const avgWinRate = (mapStats.reduce((s, m) => s + parseFloat(m.winRate), 0) / mapStats.length).toFixed(1);
            const isStrong = parseFloat(avgWinRate) >= 65;
            return (
              <div key={mapName} style={styles.mapCard}>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: 14, marginBottom: 4 }}>{mapName}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: isStrong ? '#22c55e' : parseFloat(avgWinRate) < 57 ? '#ff4655' : '#f59e0b' }}>
                  {avgWinRate}%
                </div>
                <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginTop: 4 }}>TEAM AVG WIN RATE</div>
                <div style={{ ...styles.mapTag, color: isStrong ? '#22c55e' : '#ff4655', background: isStrong ? 'rgba(34,197,94,0.08)' : 'rgba(255,70,85,0.08)' }}>
                  {isStrong ? 'STRONG MAP' : 'WEAK MAP'}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── PLAYER DETAIL SIDE PANEL ── */}
      {selectedPlayer && (
        <PlayerDetailPanel
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onAdvice={(p) => { setAdvicePlayer(p); setSelectedPlayer(null); }}
        />
      )}

      {/* ── AI ADVICE MODAL ── */}
      {advicePlayer && (
        <AIModal
          player={advicePlayer}
          onClose={() => setAdvicePlayer(null)}
        />
      )}

    </div>
  );
};

// ── Styles ────────────────────────────────────────────────
const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", color: '#ccc' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: '#0f1117', borderBottom: '1px solid #1a1f2e', position: 'sticky', top: 0, zIndex: 10 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { background: 'rgba(255,70,85,0.12)', borderRadius: 6, padding: '3px 5px', display: 'flex' },
  logoText: { fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  headerName: { fontSize: 13, color: '#888', letterSpacing: 1 },
  headerAvatar: { width: 34, height: 34, borderRadius: '50%', border: '2px solid #ff4655', objectFit: 'cover' },

  body: { padding: '28px 40px' },

  banner: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  bannerAvatar: { width: 68, height: 68, borderRadius: '50%', border: '3px solid #ff4655', objectFit: 'cover' },
  bannerName: { fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  badge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#888', letterSpacing: 1 },
  teamStats: { display: 'flex', gap: 20 },
  teamStatBox: { background: '#0a0d14', border: '1px solid #1a1f2e', borderRadius: 8, padding: '12px 20px', textAlign: 'center', minWidth: 100 },

  sectionTitle: { display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 12, marginTop: 8 },

  tableCard: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, overflow: 'hidden', marginBottom: 28 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: 10, color: '#555', letterSpacing: 2, textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid #1a1f2e', fontWeight: 700, background: '#0a0d14' },
  td: { fontSize: 13, color: '#888', padding: '14px 16px', borderBottom: '1px solid #0f1117' },
  tr: { cursor: 'pointer', transition: 'background 0.15s' },
  rowAvatar: { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1a1f2e' },
  winRateBadge: { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 4, padding: '3px 8px', fontWeight: 700, fontSize: 12 },
  detailBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.25)', color: '#ff4655', borderRadius: 5, padding: '5px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif" },

  mapGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28 },
  mapCard: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '18px 16px' },
  mapTag: { display: 'inline-block', borderRadius: 4, padding: '3px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginTop: 8 },
};

const detail = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' },
  panel: { width: 520, background: '#0f1117', borderLeft: '1px solid #1a1f2e', height: '100vh', overflowY: 'auto', padding: '24px 28px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: '50%', border: '2px solid #ff4655', objectFit: 'cover' },
  name: { fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  aiBtn: { display: 'inline-flex', alignItems: 'center', background: 'rgba(255,70,85,0.15)', border: '1px solid rgba(255,70,85,0.3)', color: '#ff4655', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif" },
  closeBtn: { background: 'transparent', border: '1px solid #1a1f2e', color: '#555', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 },
  statBox: { background: '#0a0d14', border: '1px solid #1a1f2e', borderRadius: 7, padding: '10px 12px' },
  sectionTitle: { display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 10 },
  th: { fontSize: 10, color: '#555', letterSpacing: 1, textAlign: 'left', paddingBottom: 8, fontWeight: 700 },
  td: { fontSize: 12, color: '#888', padding: '8px 0', borderBottom: '1px solid #1a1f2e' },
};

const modal = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  box: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 12, width: 580, maxHeight: '85vh', overflowY: 'auto', padding: '28px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #1a1f2e' },
  avatar: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #ff4655', objectFit: 'cover' },
  playerName: { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  verdictBadge: { display: 'inline-flex', alignItems: 'center', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 900, letterSpacing: 2, marginLeft: 12 },
  closeBtn: { background: 'transparent', border: '1px solid #1a1f2e', color: '#555', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex' },
  body: { display: 'flex', flexDirection: 'column' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0' },
  spinner: { width: 32, height: 32, border: '3px solid #1a1f2e', borderTop: '3px solid #ff4655', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

export default CoachDashboardView;
