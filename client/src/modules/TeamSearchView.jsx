import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { PLAYERS_LIST } from '../data/mockData';
import { Search, Shield, User, ChevronRight, X } from 'lucide-react';

const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('RADIANT'))  return '#ffffa0';
  if (rank.includes('IMMORTAL')) return '#ff4655';
  if (rank.includes('DIAMOND'))  return '#a78bfa';
  if (rank.includes('PLATINUM')) return '#38bdf8';
  return '#888';
};

const TeamSearchView = () => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = PLAYERS_LIST.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.valorantId.toLowerCase().includes(query.toLowerCase()) ||
    p.team.toLowerCase().includes(query.toLowerCase())
  );

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
                key={player.id}
                style={styles.card}
                onClick={() => setSelected(player)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,70,85,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1f2e'}
              >
                {/* Avatar + name */}
                <div style={styles.cardTop}>
                  <img src={player.avatar} alt={player.name} style={styles.cardAvatar} />
                  <div style={{ flex: 1 }}>
                    <div style={styles.cardName}>{player.name}</div>
                    <div style={styles.cardId}>{player.valorantId}</div>
                    <div style={{ ...styles.cardRank, color: rankColor(player.currentRank) }}>
                      {player.currentRank} · {player.rankRating} RR
                    </div>
                  </div>
                </div>

                {/* Team badge */}
                <div style={styles.teamBadge}>
                  <Shield size={11} color="#ff4655" style={{ marginRight: 5 }} />
                  {player.team}
                </div>

                {/* Key stats */}
                <div style={styles.cardStats}>
                  {[
                    { label: 'K/D', value: player.kdRatio },
                    { label: 'WIN%', value: player.winRate },
                    { label: 'ACS', value: player.acs },
                    { label: 'HS%', value: player.headshotPercent },
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
            <div style={modal.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={selected.avatar} alt={selected.name} style={modal.avatar} />
                <div>
                  <div style={modal.name}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{selected.valorantId}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: rankColor(selected.currentRank), marginTop: 4 }}>
                    {selected.currentRank} · {selected.rankRating} RR
                  </div>
                </div>
              </div>
              <button style={modal.closeBtn} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Stats grid */}
            <div style={modal.statsGrid}>
              {[
                { label: 'K/D', value: selected.kdRatio },
                { label: 'WIN RATE', value: selected.winRate },
                { label: 'ACS', value: selected.acs },
                { label: 'HS%', value: selected.headshotPercent },
                { label: 'KAST', value: selected.kast },
                { label: 'DMG/RND', value: selected.damagePerRound },
                { label: 'KILLS', value: selected.kills },
                { label: 'MATCHES', value: selected.matches },
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
                {selected.topAgents.map(a => (
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
            {selected.topMaps.map(m => (
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

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", color: '#ccc' },
  body: { padding: '40px 40px' },
  searchSection: { maxWidth: 700, marginBottom: 36 },
  title: { fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: 4, margin: '0 0 6px 0' },
  subtitle: { fontSize: 13, color: '#444', letterSpacing: 1, marginBottom: 20 },
  searchBar: { display: 'flex', alignItems: 'center', gap: 12, background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '14px 16px', transition: 'border-color 0.2s' },
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
