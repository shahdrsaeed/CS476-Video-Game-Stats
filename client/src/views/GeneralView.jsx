import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Activity, ShieldCheck, User, TrendingUp, Map, Crosshair, Target, Award } from 'lucide-react';

// ─────────────────────────────────────────────
// Helpers (same as CoachPanel)
// ─────────────────────────────────────────────

const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('Radiant'))  return '#ffffa0';
  if (rank.includes('Immortal')) return '#ff4655';
  if (rank.includes('Diamond'))  return '#a78bfa';
  if (rank.includes('Platinum')) return '#38bdf8';
  return '#888';
};

const winRateColor = (wr) => {
  const n = parseFloat(wr);
  if (isNaN(n)) return '#555';
  if (n >= 65) return '#22c55e';
  if (n < 50)  return '#ff4655';
  return '#f59e0b';
};

const pct = (v) => (v == null ? 'N/A' : `${parseFloat(v).toFixed(1)}%`);

// ─────────────────────────────────────────────
// Adapter — same logic as CoachPanel
// ─────────────────────────────────────────────
const adaptPlayer = (raw) => ({
  ...raw,
  id:              raw._id,
  name:            raw.username,
  avatar:          raw.imageURL || '/default-avatar.png',
  currentRank:     raw.rank ?? 'Unranked',
  rankRating:      raw.rr ?? 0,
  level:           raw.level ?? 1,
  kdRatio:         parseFloat(raw.kdRatio   ?? 0),
  winRate:         parseFloat(raw.winRate   ?? 0),
  acs:             raw.stats?.acs           ?? 0,
  headshotPct:     parseFloat(raw.headshotPercentage ?? 0),
  bodyshotPct:     parseFloat(raw.bodyshotPercentage ?? 0),
  legshotPct:      parseFloat(raw.legshotPercentage  ?? 0),
  kills:           raw.stats?.kills         ?? 0,
  deaths:          raw.stats?.deaths        ?? 0,
  assists:         raw.stats?.assists       ?? 0,
  wins:            raw.stats?.wins          ?? 0,
  losses:          raw.stats?.losses        ?? 0,
  matches:         (raw.stats?.wins ?? 0) + (raw.stats?.losses ?? 0),
  topAgents: (raw.topAgents ?? []).map(a => ({
    name:    a.agent?.name   ?? 'Unknown',
    matches: a.matchesPlayed ?? 0,
    wins:    a.wins          ?? 0,
    kills:   a.kills         ?? 0,
    deaths:  a.deaths        ?? 0,
    winRate: a.matchesPlayed ? ((a.wins / a.matchesPlayed) * 100).toFixed(1) : '0',
    kd:      a.deaths === 0  ? a.kills : (a.kills / a.deaths).toFixed(2),
  })),
  topMaps: (raw.topMaps ?? []).map(m => ({
    map:     m.map?.name      ?? 'Unknown',
    wins:    m.wins           ?? 0,
    losses:  m.losses         ?? 0,
    played:  m.matchesPlayed  ?? 0,
    winRate: m.matchesPlayed  ? ((m.wins / m.matchesPlayed) * 100).toFixed(1) : '0',
  })),
  recentMatches: (raw.last20Matches ?? []).map(m => ({
    result: m.result === 'Win' ? 'W' : 'L',
  })),
});

// ─────────────────────────────────────────────
// Derived team-wide metrics from roster
// ─────────────────────────────────────────────
const buildTeamStats = (players) => {
  if (players.length === 0) return null;

  // Averages
  const avgKD      = (players.reduce((s, p) => s + p.kdRatio,    0) / players.length).toFixed(2);
  const avgWin     = (players.reduce((s, p) => s + p.winRate,    0) / players.length).toFixed(1);
  const avgACS     = (players.reduce((s, p) => s + p.acs,        0) / players.length).toFixed(0);
  const avgHS      = (players.reduce((s, p) => s + p.headshotPct,0) / players.length).toFixed(1);
  const avgBody    = (players.reduce((s, p) => s + p.bodyshotPct,0) / players.length).toFixed(1);
  const avgLegs    = (players.reduce((s, p) => s + p.legshotPct, 0) / players.length).toFixed(1);

  // Totals
  const totalKills   = players.reduce((s, p) => s + p.kills,   0);
  const totalDeaths  = players.reduce((s, p) => s + p.deaths,  0);
  const totalWins    = players.reduce((s, p) => s + p.wins,    0);
  const totalMatches = players.reduce((s, p) => s + p.matches, 0);

  // Last-5 team form (majority of players' last results)
  const form = [];
  for (let i = 0; i < 5; i++) {
    const wins = players.filter(p => p.recentMatches[i]?.result === 'W').length;
    form.push(wins >= players.length / 2 ? 'W' : 'L');
  }

  // Top agents across the team (aggregate by agent name)
  const agentMap = {};
  players.forEach(p => {
    p.topAgents.forEach(a => {
      if (!agentMap[a.name]) agentMap[a.name] = { name: a.name, matches: 0, wins: 0, kills: 0, deaths: 0 };
      agentMap[a.name].matches += a.matches;
      agentMap[a.name].wins    += a.wins;
      agentMap[a.name].kills   += a.kills;
      agentMap[a.name].deaths  += a.deaths;
    });
  });
  const topAgents = Object.values(agentMap)
    .map(a => ({
      ...a,
      winRate: a.matches ? ((a.wins / a.matches) * 100).toFixed(1) : '0',
      kd:      a.deaths === 0 ? a.kills.toFixed(2) : (a.kills / a.deaths).toFixed(2),
    }))
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 6);

  // Map performance — aggregate across all players
  const mapMap = {};
  players.forEach(p => {
    p.topMaps.forEach(m => {
      if (!mapMap[m.map]) mapMap[m.map] = { map: m.map, wins: 0, losses: 0, played: 0 };
      mapMap[m.map].wins   += m.wins;
      mapMap[m.map].losses += m.losses;
      mapMap[m.map].played += m.played;
    });
  });
  const mapStats = Object.values(mapMap)
    .filter(m => m.played > 0)
    .map(m => ({ ...m, winRate: ((m.wins / m.played) * 100).toFixed(1) }))
    .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));

  return { avgKD, avgWin, avgACS, avgHS, avgBody, avgLegs, totalKills, totalDeaths, totalWins, totalMatches, form, topAgents, mapStats };
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div style={gv.statCard}>
    <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 900, color: accent || '#fff', letterSpacing: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: '#444', marginTop: 4, letterSpacing: 1 }}>{sub}</div>}
  </div>
);

const SectionTitle = ({ icon, label, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 12, marginTop: 24 }}>
    {icon}<span style={{ marginLeft: 8 }}>{label}</span>
    {sub && <span style={{ fontSize: 11, color: '#333', marginLeft: 10, fontWeight: 400, letterSpacing: 0 }}>{sub}</span>}
  </div>
);

const FormDot = ({ result }) => (
  <div style={{
    width: 28, height: 28, borderRadius: '50%',
    background: result === 'W' ? 'rgba(34,197,94,0.15)' : 'rgba(255,70,85,0.15)',
    border: `2px solid ${result === 'W' ? '#22c55e' : '#ff4655'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 900,
    color: result === 'W' ? '#22c55e' : '#ff4655',
  }}>
    {result}
  </div>
);

// ─────────────────────────────────────────────
// Main General View
// ─────────────────────────────────────────────
const GeneralView = () => {
  const [players, setPlayers] = useState([]);
  const [coach,   setCoach]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState(null); // ← add this state
  const loggedInUser = JSON.parse(localStorage.getItem('user')); // moved this from helper functions to here so that it is updated between logins

// modified this
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');

        if (loggedInUser?._id) {
          const cr = await fetch(`/api/users/${loggedInUser._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cr.ok) {
            const freshUser = await cr.json();
            setCoach(freshUser); // this is the logged in user (player or coach)
            setTeamId(freshUser.teamId ?? null); // ← always set, even if null

            // ← Fetch actual coach if logged in user is a player
            let coachData = freshUser;
            if (freshUser.role === 'Player' && freshUser.coach) {
              const coachId = freshUser.coach?._id ?? freshUser.coach;
              const coachRes = await fetch(`/api/coach/${coachId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (coachRes.ok) coachData = await coachRes.json();
            }
            setCoach(coachData); // now always the actual coach

            const freshTeamId = freshUser.teamId?._id ?? freshUser.teamId;
            setTeamId(freshTeamId);

            if (freshTeamId) {
              const pr = await fetch(`/api/teams/${freshTeamId}/players`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!pr.ok) throw new Error('Failed to fetch players');
              const data = await pr.json();
              setPlayers(data.map(adaptPlayer));
            }
          }
        }
      } catch (err) {
        console.error('GeneralView load error:', err);
      } finally {
        setLoading(false); // ← always called last, after all state is set
      }
    };
    load();
  }, []);

  // ── Guards ──────────────────────────────────
  if (loading) return (
    <div style={gv.page}>
      <Navbar />
      <div style={{ color: '#555', padding: 60, textAlign: 'center', letterSpacing: 2, fontSize: 13 }}>LOADING...</div>
    </div>
  );

  if (!teamId) return (   // ← was loggedInUser?.teamId, ensures team check is based on what in the db instead of localStorage
  <div style={gv.page}>
    <Navbar />
    <div style={gv.emptyState}>
      <ShieldCheck size={48} color="#333" />
      <p style={gv.emptyTitle}>NO TEAM ASSIGNED</p>
      <p style={gv.emptySub}>You do not have a team yet.</p>
    </div>
  </div>
);

  const stats = buildTeamStats(players);

  if (!stats) return (
    <div style={gv.page}>
      <Navbar />
      <div style={gv.emptyState}>
        <User size={48} color="#333" />
        <p style={gv.emptyTitle}>NO PLAYERS ON ROSTER</p>
        <p style={gv.emptySub}>Add players via Team Search to see team stats here.</p>
      </div>
    </div>
  );

  return (
    <div style={gv.page}>
      <Navbar />
      <div style={gv.body}>

        {/* ── COACH + TEAM IDENTITY BANNER ── */}
        <div style={gv.banner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img
              src={coach?.imageURL || '/default-avatar.png'}
              alt={coach?.username}
              style={gv.bannerAvatar}
              onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
            />
            <div>
              <div style={gv.bannerName}>{coach?.username ?? 'Coach'}</div>
              <div style={{ fontSize: 12, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                {coach?.title ?? 'Head Coach'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={gv.badge}><ShieldCheck size={11} style={{ marginRight: 4 }} />{coach?.teamName ?? 'Team'}</span>
                <span style={gv.badge}><User size={11} style={{ marginRight: 4 }} />{players.length} PLAYERS</span>
                <span style={gv.badge}><Activity size={11} style={{ marginRight: 4 }} />{stats.totalMatches} TOTAL MATCHES</span>
              </div>
            </div>
          </div>

          {/* Team form (last 5 majority results) */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 8 }}>TEAM FORM (LAST 5)</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              {stats.form.map((r, i) => <FormDot key={i} result={r} />)}
            </div>
          </div>
        </div>

        {/* ── KEY TEAM STATS ── */}
        <SectionTitle icon={<TrendingUp size={13} color="#ff4655" />} label="TEAM OVERVIEW" sub="Averaged across all roster players" />
        <div style={gv.statsGrid}>
          <StatCard label="AVG K/D"       value={stats.avgKD}   accent={parseFloat(stats.avgKD) >= 1.4 ? '#22c55e' : parseFloat(stats.avgKD) < 1.1 ? '#ff4655' : '#fff'} />
          <StatCard label="AVG WIN RATE"  value={stats.avgWin + '%'} accent={winRateColor(stats.avgWin)} sub={`${stats.totalWins}W — ${stats.totalMatches - stats.totalWins}L`} />
          <StatCard label="AVG ACS"       value={stats.avgACS} />
          <StatCard label="TOTAL KILLS"   value={stats.totalKills.toLocaleString()} />
          <StatCard label="TOTAL MATCHES" value={stats.totalMatches.toLocaleString()} />
          <StatCard label="ROSTER SIZE"   value={players.length} />
        </div>

        {/* ── ACCURACY ── */}
        <SectionTitle icon={<Crosshair size={13} color="#ff4655" />} label="TEAM ACCURACY" sub="Average shot placement across roster" />
        <div style={gv.card}>
          {[
            { zone: 'Headshot', pctVal: stats.avgHS,   color: '#ff4655' },
            { zone: 'Bodyshot', pctVal: stats.avgBody, color: '#38bdf8' },
            { zone: 'Legshot',  pctVal: stats.avgLegs, color: '#888'    },
          ].map(a => (
            <div key={a.zone} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#666', width: 72 }}>{a.zone}</span>
              <div style={{ flex: 1, height: 8, background: '#1a1f2e', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${a.pctVal}%`, height: '100%', background: a.color, borderRadius: 4, transition: 'width 0.6s' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 900, color: a.color, width: 44, textAlign: 'right' }}>{a.pctVal}%</span>
            </div>
          ))}
        </div>

        {/* ── ROSTER SUMMARY TABLE ── */}
        <SectionTitle icon={<User size={13} color="#ff4655" />} label="PLAYER SUMMARY" sub="Same data as Coach Panel — summary view" />
        <div style={gv.tableCard}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['PLAYER', 'RANK', 'K/D', 'WIN RATE', 'ACS', 'HS%', 'MATCHES'].map(h => (
                  <th key={h} style={gv.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #0f1117' }}>
                  <td style={gv.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={p.avatar} alt={p.name} style={gv.rowAvatar}
                        onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
                      <div>
                        <div style={{ fontWeight: 900, color: '#fff', fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: '#555' }}>LVL {p.level}</div>
                      </div>
                    </div>
                  </td>
                  <td style={gv.td}>
                    <span style={{ color: rankColor(p.currentRank), fontWeight: 900 }}>{p.currentRank}</span>
                    <div style={{ fontSize: 10, color: '#555' }}>{p.rankRating} RR</div>
                  </td>
                  <td style={{ ...gv.td, fontWeight: 900, color: p.kdRatio >= 1.4 ? '#22c55e' : p.kdRatio < 1.1 ? '#ff4655' : '#fff', fontSize: 15 }}>
                    {p.kdRatio.toFixed(2)}
                  </td>
                  <td style={gv.td}>
                    <span style={{ color: winRateColor(p.winRate), fontWeight: 700 }}>{p.winRate.toFixed(1)}%</span>
                  </td>
                  <td style={{ ...gv.td, color: '#ff4655', fontWeight: 700 }}>{p.acs}</td>
                  <td style={gv.td}>{pct(p.headshotPct)}</td>
                  <td style={gv.td}>{p.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── MAP PERFORMANCE SUMMARY ── */}
        {stats.mapStats.length > 0 && (
          <>
            <SectionTitle icon={<Map size={13} color="#ff4655" />} label="MAP PERFORMANCE" sub="Aggregated across all roster members" />
            <div style={gv.mapGrid}>
              {stats.mapStats.map(m => {
                const isStrong = parseFloat(m.winRate) >= 65;
                const isWeak   = parseFloat(m.winRate) < 50;
                return (
                  <div key={m.map} style={gv.mapCard}>
                    <div style={{ fontWeight: 900, color: '#fff', fontSize: 15, marginBottom: 4 }}>{m.map}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: winRateColor(m.winRate), letterSpacing: 1 }}>
                      {m.winRate}%
                    </div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{m.wins}W – {m.losses}L · {m.played} games</div>
                    <div style={{
                      marginTop: 10, display: 'inline-block', borderRadius: 4, padding: '3px 8px',
                      fontSize: 10, fontWeight: 700, letterSpacing: 1,
                      color: isStrong ? '#22c55e' : isWeak ? '#ff4655' : '#f59e0b',
                      background: isStrong ? 'rgba(34,197,94,0.08)' : isWeak ? 'rgba(255,70,85,0.08)' : 'rgba(245,158,11,0.08)',
                    }}>
                      {isStrong ? 'STRONG' : isWeak ? 'WEAK' : 'AVERAGE'}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── TOP AGENTS ── */}
        {stats.topAgents.length > 0 && (
          <>
            <SectionTitle icon={<Target size={13} color="#ff4655" />} label="TEAM AGENT POOL" sub="Most-played agents across the roster" />
            <div style={gv.tableCard}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['AGENT', 'MATCHES', 'WIN RATE', 'K/D'].map(h => <th key={h} style={gv.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {stats.topAgents.map(a => (
                    <tr key={a.name} style={{ borderBottom: '1px solid #0f1117' }}>
                      <td style={{ ...gv.td, color: '#fff', fontWeight: 900, fontSize: 14 }}>{a.name}</td>
                      <td style={gv.td}>{a.matches}</td>
                      <td style={{ ...gv.td, color: winRateColor(a.winRate), fontWeight: 700 }}>{a.winRate}%</td>
                      <td style={{ ...gv.td, fontWeight: 700, color: parseFloat(a.kd) >= 1.4 ? '#22c55e' : parseFloat(a.kd) < 1 ? '#ff4655' : '#fff' }}>{a.kd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const gv = {
  page:        { minHeight: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed','Arial Narrow',sans-serif", color: '#ccc' },
  body:        { padding: '28px 40px' },
  emptyState:  { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', textAlign: 'center' },
  emptyTitle:  { color: '#333', marginTop: 16, letterSpacing: 2, fontSize: 13, fontWeight: 700 },
  emptySub:    { color: '#222', fontSize: 11, letterSpacing: 1, marginTop: 4 },

  banner:      { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  bannerAvatar:{ width: 68, height: 68, borderRadius: '50%', border: '3px solid #ff4655', objectFit: 'cover' },
  bannerName:  { fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  badge:       { display: 'inline-flex', alignItems: 'center', background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#888', letterSpacing: 1 },

  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 4 },
  statCard:    { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '14px 12px', textAlign: 'center' },

  card:        { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '20px 24px', marginBottom: 4 },

  tableCard:   { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, overflow: 'hidden', marginBottom: 4 },
  th:          { fontSize: 10, color: '#555', letterSpacing: 2, textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #1a1f2e', fontWeight: 700, background: '#0a0d14' },
  td:          { fontSize: 13, color: '#888', padding: '12px 16px' },
  rowAvatar:   { width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1a1f2e' },

  mapGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 4 },
  mapCard:     { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '18px 16px' },
};

export default GeneralView;
