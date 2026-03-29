import React, { useState } from 'react';
import { Shield, User, Target, TrendingUp, Map, Crosshair, Award, RefreshCw } from 'lucide-react';
import { PLAYERS_LIST } from '../data/mockData';
import Navbar from '../components/Navbar';

// ── Rank color helper ──
const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('RADIANT'))  return '#ffffa0';
  if (rank.includes('IMMORTAL')) return '#ff4655';
  if (rank.includes('DIAMOND'))  return '#a78bfa';
  if (rank.includes('PLATINUM')) return '#38bdf8';
  return '#888';
};

const resultColor = (r) => r === 'W' ? '#22c55e' : '#ff4655';

// ── Random helpers ──
const maps = ['Haven', 'Pearl', 'Bind', 'Abyss', 'Split', 'Breeze', 'Corrode'];
const placements = ['MVP', '2nd', '3rd', '4th', '5th'];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

const generateFakeMatch = () => {
  const kills = rand(10, 35);
  const deaths = rand(8, 25);
  const assists = rand(2, 12);
  const result = Math.random() > 0.4 ? 'W' : 'L';
  const score = result === 'W'
    ? `13:${rand(0, 10)}`
    : `${rand(5, 12)}:13`;
  return {
    date: 'Today',
    map: maps[rand(0, maps.length - 1)],
    result,
    score,
    kd: parseFloat((kills / deaths).toFixed(1)),
    kda: `${kills}/${deaths}/${assists}`,
    ddDelta: rand(-50, 150),
    hs: rand(20, 55),
    acs: rand(180, 450),
    placement: placements[rand(0, placements.length - 1)],
    rr: rand(400, 1000),
  };
};

const PlayerProfileView = () => {
  const basePlayer = PLAYERS_LIST[0];
  const [player, setPlayer] = useState(basePlayer);
  const [justUpdated, setJustUpdated] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleSimulateMatch = () => {
    setSpinning(true);
    setTimeout(() => {
      const newMatch = generateFakeMatch();
      const won = newMatch.result === 'W';
      const [k, d, a] = newMatch.kda.split('/').map(Number);

      setPlayer(prev => {
        const newKills    = prev.kills + k;
        const newDeaths   = prev.deaths + d;
        const newAssists  = prev.assists + a;
        const newMatches  = prev.matches + 1;
        const newWins     = won ? prev.wins + 1 : prev.wins;
        const newKD       = parseFloat((newKills / newDeaths).toFixed(2));
        const newWinRate  = `${((newWins / newMatches) * 100).toFixed(1)}%`;
        const newACS      = parseFloat(((prev.acs * prev.matches + newMatch.acs) / newMatches).toFixed(1));
        const newHS       = `${((parseFloat(prev.headshotPercent) * prev.matches + newMatch.hs) / newMatches).toFixed(1)}%`;

        return {
          ...prev,
          kills: newKills,
          deaths: newDeaths,
          assists: newAssists,
          matches: newMatches,
          wins: newWins,
          kdRatio: newKD,
          winRate: newWinRate,
          acs: newACS,
          headshotPercent: newHS,
          recentMatches: [newMatch, ...prev.recentMatches.slice(0, 5)],
        };
      });

      setSpinning(false);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    }, 800);
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.body}>

        {/* ── PROFILE BANNER ── */}
        <div style={styles.profileBanner}>
          <div style={styles.bannerLeft}>
            <img src={player.avatar} alt={player.name} style={styles.bannerAvatar} />
            <div>
              <div style={styles.bannerName}>{player.name}</div>
              <div style={styles.bannerTag}>{player.valorantId}</div>
              <div style={styles.bannerMeta}>
                <span style={styles.metaBadge}>{player.team}</span>
                <span style={styles.metaBadge}>LVL {player.level}</span>
                <span style={styles.metaBadge}>{player.playtime} · {player.matches} matches</span>
              </div>
            </div>
          </div>
          <div style={styles.bannerRank}>
            <div style={{ fontSize: 11, color: '#555', letterSpacing: 2, marginBottom: 4 }}>CURRENT RANK</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: rankColor(player.currentRank), letterSpacing: 2 }}>{player.currentRank}</div>
            <div style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>{player.rankRating} <span style={{ fontSize: 12, color: '#555' }}>RR</span></div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Peak: {player.peakRank} {player.peakRR} RR</div>
          </div>
        </div>

        {/* ── STAT CARDS ROW ── */}
        <div style={styles.statCardsRow}>
          {[
            { label: 'K/D RATIO',    value: player.kdRatio,          sub: 'Top 9.0%' },
            { label: 'WIN RATE',     value: player.winRate,           sub: `${player.wins}W - ${player.losses}L` },
            { label: 'ACS',          value: player.acs,               sub: 'Top 7.0%' },
            { label: 'HEADSHOT %',   value: player.headshotPercent,   sub: 'Top 3.1%' },
            { label: 'DMG/ROUND',    value: player.damagePerRound,    sub: 'Top 7.0%' },
            { label: 'KAST',         value: player.kast,              sub: 'Top 19.0%' },
          ].map((s) => (
            <div key={s.label} style={{ ...styles.statCard, ...(justUpdated ? styles.statCardFlash : {}) }}>
              <div style={styles.statCardLabel}>{s.label}</div>
              <div style={styles.statCardValue}>{s.value}</div>
              <div style={styles.statCardSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── DETAILED STATS ── */}
        <div style={styles.sectionTitle}><TrendingUp size={14} color="#ff4655" style={{ marginRight: 8 }} />DETAILED STATS</div>
        <div style={styles.detailGrid}>
          {[
            { label: 'Kills',           value: player.kills },
            { label: 'Deaths',          value: player.deaths },
            { label: 'Assists',         value: player.assists },
            { label: 'KAD Ratio',       value: player.kadRatio },
            { label: 'Kills/Round',     value: player.killsPerRound },
            { label: 'First Bloods',    value: player.firstBloods },
            { label: 'Flawless Rounds', value: player.flawlessRounds },
            { label: 'Aces',            value: player.aces },
            { label: 'DD∆/Round',       value: player.ddDeltaPerRound },
            { label: 'Round Win %',     value: player.roundWinRate },
          ].map((s) => (
            <div key={s.label} style={styles.detailItem}>
              <div style={styles.detailLabel}>{s.label}</div>
              <div style={styles.detailValue}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── TWO COLUMN: ACCURACY + ROLES ── */}
        <div style={styles.twoCol}>
          <div style={styles.card}>
            <div style={styles.cardTitle}><Crosshair size={13} color="#ff4655" style={{ marginRight: 7 }} />ACCURACY</div>
            {[
              { zone: 'Head', pct: player.accuracy.head, color: '#ff4655' },
              { zone: 'Body', pct: player.accuracy.body, color: '#38bdf8' },
              { zone: 'Legs', pct: player.accuracy.legs, color: '#888' },
            ].map((a) => (
              <div key={a.zone} style={styles.accuracyRow}>
                <span style={styles.accuracyLabel}>{a.zone}</span>
                <div style={styles.accuracyBarWrap}>
                  <div style={{ ...styles.accuracyBar, width: a.pct, background: a.color }} />
                </div>
                <span style={{ ...styles.accuracyPct, color: a.color }}>{a.pct}</span>
              </div>
            ))}
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}><Shield size={13} color="#ff4655" style={{ marginRight: 7 }} />ROLES</div>
            {player.roles.map((r) => (
              <div key={r.role} style={styles.roleRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{r.role}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{r.wins}W - {r.losses}L</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#22c55e', fontWeight: 900, fontSize: 14 }}>{r.winRate}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>KDA {r.kda}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TWO COLUMN: TOP AGENTS + TOP MAPS ── */}
        <div style={styles.twoCol}>
          <div style={styles.card}>
            <div style={styles.cardTitle}><User size={13} color="#ff4655" style={{ marginRight: 7 }} />TOP AGENTS</div>
            <table style={styles.miniTable}>
              <thead>
                <tr>{['AGENT','MATCHES','WIN%','K/D','ACS'].map(h => <th key={h} style={styles.miniTh}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {player.topAgents.map((a) => (
                  <tr key={a.name}>
                    <td style={styles.miniTd}><div style={{ fontWeight: 700, color: '#fff' }}>{a.name}</div><div style={{ fontSize: 10, color: '#555' }}>{a.hours}h</div></td>
                    <td style={styles.miniTd}>{a.matches}</td>
                    <td style={{ ...styles.miniTd, color: '#22c55e', fontWeight: 700 }}>{a.winRate}</td>
                    <td style={{ ...styles.miniTd, fontWeight: 700 }}>{a.kd}</td>
                    <td style={{ ...styles.miniTd, color: '#ff4655', fontWeight: 700 }}>{a.acs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}><Map size={13} color="#ff4655" style={{ marginRight: 7 }} />TOP MAPS</div>
            {player.topMaps.map((m) => (
              <div key={m.map} style={styles.mapRow}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, flex: 1 }}>{m.map}</span>
                <span style={{ fontSize: 11, color: '#555', marginRight: 16 }}>{m.wins}W - {m.losses}L</span>
                <span style={{ color: '#22c55e', fontWeight: 900, fontSize: 14 }}>{m.winRate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOP WEAPONS ── */}
        <div style={styles.sectionTitle}><Target size={14} color="#ff4655" style={{ marginRight: 8 }} />TOP WEAPONS</div>
        <div style={styles.weaponsRow}>
          {player.topWeapons.map((w) => (
            <div key={w.weapon} style={styles.weaponCard}>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 15, letterSpacing: 1 }}>{w.weapon}</div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>{w.type}</div>
              <div style={styles.weaponKills}>{w.kills} <span style={{ fontSize: 11, color: '#555', fontWeight: 400 }}>kills</span></div>
              <div style={styles.weaponAccRow}>
                <span style={{ color: '#ff4655' }}>H {w.headshotPct}</span>
                <span style={{ color: '#38bdf8' }}>B {w.bodyPct}</span>
                <span style={{ color: '#888' }}>L {w.legsPct}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── RECENT MATCHES ── */}
        <div style={styles.sectionTitle}><Award size={14} color="#ff4655" style={{ marginRight: 8 }} />RECENT MATCHES</div>
        <div style={styles.card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['DATE','MAP','RESULT','SCORE','K/D','K/D/A','DD∆','HS%','ACS','PLACE'].map(h => (
                  <th key={h} style={styles.matchTh}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {player.recentMatches.map((m, i) => (
                <tr key={i} style={{ background: i === 0 && justUpdated ? 'rgba(255,70,85,0.05)' : 'transparent' }}>
                  <td style={styles.matchTd}>{m.date}</td>
                  <td style={{ ...styles.matchTd, color: '#fff', fontWeight: 700 }}>{m.map}</td>
                  <td style={{ ...styles.matchTd, color: resultColor(m.result), fontWeight: 900 }}>{m.result}</td>
                  <td style={styles.matchTd}>{m.score}</td>
                  <td style={{ ...styles.matchTd, fontWeight: 700, color: m.kd >= 1.5 ? '#22c55e' : m.kd < 1 ? '#ff4655' : '#fff' }}>{m.kd}</td>
                  <td style={styles.matchTd}>{m.kda}</td>
                  <td style={{ ...styles.matchTd, color: m.ddDelta > 0 ? '#22c55e' : '#ff4655' }}>{m.ddDelta > 0 ? '+' : ''}{m.ddDelta}</td>
                  <td style={styles.matchTd}>{m.hs}%</td>
                  <td style={{ ...styles.matchTd, color: '#ff4655', fontWeight: 700 }}>{m.acs}</td>
                  <td style={{ ...styles.matchTd, color: m.placement === 'MVP' ? '#ffffa0' : '#888', fontWeight: 700 }}>{m.placement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── SIMULATE MATCH BUTTON ── */}
        <div style={styles.simulateSection}>
          {justUpdated && (
            <div style={styles.successMsg}>
              ✓ Match simulated — stats updated!
            </div>
          )}
          <button
            style={{ ...styles.simulateBtn, opacity: spinning ? 0.7 : 1 }}
            onClick={handleSimulateMatch}
            disabled={spinning}
          >
            <RefreshCw size={15} style={{ marginRight: 8, animation: spinning ? 'spin 0.8s linear infinite' : 'none' }} />
            {spinning ? 'SIMULATING MATCH...' : 'SIMULATE NEW MATCH'}
          </button>
          <p style={styles.simulateNote}>Dev tool — simulates a completed match and updates all stats</p>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes flash { 0% { border-color: #ff4655; } 100% { border-color: #1a1f2e; } }
      `}</style>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", color: '#ccc' },
  body: { padding: '28px 40px' },

  profileBanner: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  bannerLeft: { display: 'flex', alignItems: 'center', gap: 20 },
  bannerAvatar: { width: 72, height: 72, borderRadius: '50%', border: '3px solid #ff4655', objectFit: 'cover' },
  bannerName: { fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  bannerTag: { fontSize: 13, color: '#555', letterSpacing: 1, marginBottom: 8 },
  bannerMeta: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  metaBadge: { background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#888', letterSpacing: 1 },
  bannerRank: { textAlign: 'right' },

  statCardsRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20, width: '100%' },
  statCard: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '14px 12px', textAlign: 'center', transition: 'border-color 0.4s' },
  statCardFlash: { borderColor: '#ff4655' },
  statCardLabel: { fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 6 },
  statCardValue: { fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 },
  statCardSub: { fontSize: 10, color: '#ff4655', marginTop: 4, letterSpacing: 1 },

  sectionTitle: { display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 10, marginTop: 20 },

  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20, width: '100%' },
  detailItem: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '12px 14px' },
  detailLabel: { fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 4 },
  detailValue: { fontSize: 18, fontWeight: 900, color: '#fff' },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, width: '100%' },
  card: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '18px 20px' },
  cardTitle: { display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 14 },

  accuracyRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  accuracyLabel: { fontSize: 12, color: '#666', width: 36 },
  accuracyBarWrap: { flex: 1, height: 6, background: '#1a1f2e', borderRadius: 3, overflow: 'hidden' },
  accuracyBar: { height: '100%', borderRadius: 3 },
  accuracyPct: { fontSize: 12, fontWeight: 700, width: 40, textAlign: 'right' },

  roleRow: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a1f2e', paddingBottom: 10, marginBottom: 10 },
  miniTable: { width: '100%', borderCollapse: 'collapse' },
  miniTh: { fontSize: 10, color: '#555', letterSpacing: 1, textAlign: 'left', paddingBottom: 8, fontWeight: 700 },
  miniTd: { fontSize: 13, color: '#888', padding: '8px 0', borderBottom: '1px solid #1a1f2e' },
  mapRow: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a1f2e', padding: '10px 0' },

  weaponsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20, width: '100%' },
  weaponCard: { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '18px 20px' },
  weaponKills: { fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 },
  weaponAccRow: { display: 'flex', gap: 12, fontSize: 12, fontWeight: 700 },

  matchTh: { fontSize: 10, color: '#555', letterSpacing: 1, textAlign: 'left', paddingBottom: 10, fontWeight: 700 },
  matchTd: { fontSize: 13, color: '#888', padding: '10px 0', borderBottom: '1px solid #1a1f2e' },

  simulateSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0 20px', gap: 10 },
  successMsg: { fontSize: 13, color: '#22c55e', letterSpacing: 2, fontWeight: 700 },
  simulateBtn: { display: 'flex', alignItems: 'center', background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.3)', color: '#ff4655', borderRadius: 8, padding: '12px 28px', fontSize: 13, fontWeight: 900, letterSpacing: 2, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", transition: 'background 0.2s' },
  simulateNote: { fontSize: 11, color: '#333', letterSpacing: 1 },
};

export default PlayerProfileView;
