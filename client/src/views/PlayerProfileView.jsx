import React, { useState, useEffect } from 'react';
import { Shield, User, Target, TrendingUp, Map, Crosshair, Award, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { getUser } from '../services/UserApi';
import Navbar from '../components/Navbar';
import { getPlayerStats } from '../services/UserApi';
import axios from 'axios';

// ── Rank color helper ──
const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('RADIANT'))  return '#ffffa0';
  if (rank.includes('IMMORTAL')) return '#ff4655';
  if (rank.includes('DIAMOND'))  return '#a78bfa';
  if (rank.includes('PLATINUM')) return '#38bdf8';
  return '#888';
};

const resultColor = (r) => (r === 'W' ? '#22c55e' : '#ff4655');

// ── Weighted-blend helper ──
const blend = (oldVal, newVal, n) => {
  const o = parseFloat(oldVal) || 0;
  const v = parseFloat(newVal) || 0;
  return parseFloat(((o * n + v) / (n + 1)).toFixed(2));
};

// ── Static pools for fake match generation ──
const MAPS      = ['Haven', 'Pearl', 'Bind', 'Abyss', 'Split', 'Breeze', 'Corrode'];
const AGENTS    = ['Jett', 'Reyna', 'Sage', 'Omen', 'Killjoy', 'Sova', 'Neon', 'Cypher'];
const WEAPONS   = ['Vandal', 'Phantom', 'Operator', 'Sheriff', 'Spectre'];
const WEAPON_TYPES = { Vandal: 'Rifle', Phantom: 'Rifle', Operator: 'Sniper', Sheriff: 'Sidearm', Spectre: 'SMG' };
const PLACEMENTS = ['MVP', '2nd', '3rd', '4th', '5th'];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateFakeMatch = () => {
  const kills  = rand(10, 35);
  const deaths = rand(8, 25);
  const assists = rand(2, 12);
  const result  = Math.random() > 0.4 ? 'W' : 'L';
  const score   = result === 'W' ? `13:${rand(0, 10)}` : `${rand(5, 12)}:13`;
  const hs      = rand(20, 55);
  const legs    = rand(5, 20);
  const body    = 100 - hs - legs;

  return {
    date:      'Today',
    map:       MAPS[rand(0, MAPS.length - 1)],
    agent:     AGENTS[rand(0, AGENTS.length - 1)],
    weapon:    WEAPONS[rand(0, WEAPONS.length - 1)],
    result,
    score,
    kd:        parseFloat((kills / deaths).toFixed(1)),
    kda:       `${kills}/${deaths}/${assists}`,
    kills,
    deaths,
    assists,
    ddDelta:   rand(-50, 150),
    hs,
    body,
    legs,
    acs:       rand(180, 450),
    placement: PLACEMENTS[rand(0, PLACEMENTS.length - 1)],
    isWin:     result === 'W',
  };
};

const blendPlayerStats = (prev, match) => {
  const n = prev.matchesPlayed ?? 0;

  const newKd      = blend(prev.kdRatio,            match.kd,   n);
  const newAcs     = blend(prev.acs,                match.acs,  n); 
  const newHsPct   = blend(prev.headshotPercentage, match.hs,   n);
  const newBodyPct = blend(prev.bodyshotPercentage, match.body, n);
  const newLegsPct = blend(prev.legshotPercentage,  match.legs, n);

  const newDamagePerRound  = blend(parseFloat(prev.damagePerRound)  || 0, match.acs,     n);
  const newDdDeltaPerRound = blend(parseFloat(prev.ddDeltaPerRound) || 0, match.ddDelta, n);
  const newKast            = blend(parseFloat(prev.kast)            || 0, rand(55, 85),  n);
  const newRoundWinRate    = blend(parseFloat(prev.roundWinRate)    || 0, match.isWin ? rand(52, 65) : rand(35, 49), n);

  const newWins    = (prev.stats?.wins   ?? 0) + (match.isWin ? 1 : 0);
  const newLosses  = (prev.stats?.losses ?? 0) + (match.isWin ? 0 : 1);
  const newMatches = n + 1;
  const newWinRate = ((newWins / newMatches) * 100).toFixed(1) + '%';

  const newKills   = (prev.stats?.kills   ?? 0) + match.kills;
  const newDeaths  = (prev.stats?.deaths  ?? 0) + match.deaths;
  const newAssists = (prev.stats?.assists ?? 0) + match.assists;
  const newKadRatio = parseFloat(((newKills + newAssists) / Math.max(newDeaths, 1)).toFixed(2));
  const newKillsPerRound = parseFloat((newKills / (newMatches * 13)).toFixed(2));

  const topAgents  = blendTopAgents(prev.topAgents  ?? [], match);
  const topMaps    = blendTopMaps(prev.topMaps       ?? [], match);
  const topWeapons = blendTopWeapons(prev.topWeapons ?? [], match);

  return {
    ...prev,
    matchesPlayed:      newMatches,
    kdRatio:            newKd,
    winRate:            newWinRate,
    headshotPercentage: newHsPct,
    bodyshotPercentage: newBodyPct,
    legshotPercentage:  newLegsPct,
    acs:                newAcs,
    damagePerRound:     newDamagePerRound,
    ddDeltaPerRound:    newDdDeltaPerRound,
    kast:               newKast,
    roundWinRate:       newRoundWinRate,
    stats: {
      ...prev.stats,
      wins:    newWins,
      losses:  newLosses,
      kills:   newKills,
      deaths:  newDeaths,
      assists: newAssists,
    },
    kadRatio:      newKadRatio,
    killsPerRound: newKillsPerRound,
    topAgents,
    topMaps,
    topWeapons,
  };
};

const blendTopAgents = (agents, match) => {
  const existing = agents.find(a => a.name === match.agent);
  if (existing) {
    const n = existing.matches;
    return agents.map(a => {
      if (a.name !== match.agent) return a;
      const newMatches = n + 1;
      const wins = parseFloat(a.winRate) / 100 * n + (match.isWin ? 1 : 0);
      return {
        ...a,
        matches: newMatches,
        winRate: ((wins / newMatches) * 100).toFixed(1) + '%',
        kd:      blend(a.kd, match.kd, n),
        acs:     blend(a.acs === 'N/A' ? match.acs : a.acs, match.acs, n),
      };
    });
  }
  return [...agents, {
    name:    match.agent,
    hours:   'N/A',
    matches: 1,
    winRate: match.isWin ? '100.0%' : '0.0%',
    kd:      match.kd,
    acs:     match.acs,
  }].slice(0, 5);
};

const blendTopMaps = (maps, match) => {
  const existing = maps.find(m => m.map === match.map);
  if (existing) {
    const newWins   = existing.wins   + (match.isWin ? 1 : 0);
    const newLosses = existing.losses + (match.isWin ? 0 : 1);
    const total     = newWins + newLosses;
    return maps.map(m =>
      m.map !== match.map ? m : {
        ...m,
        wins:    newWins,
        losses:  newLosses,
        winRate: ((newWins / total) * 100).toFixed(1) + '%',
      }
    );
  }
  return [...maps, {
    map:     match.map,
    wins:    match.isWin ? 1 : 0,
    losses:  match.isWin ? 0 : 1,
    winRate: match.isWin ? '100.0%' : '0.0%',
  }].slice(0, 5);
};

const blendTopWeapons = (weapons, match) => {
  const existing = weapons.find(w => w.weapon === match.weapon);
  if (existing) {
    const n = existing.kills;
    return weapons.map(w => {
      if (w.weapon !== match.weapon) return w;
      return {
        ...w,
        kills:       w.kills + match.kills,
        headshotPct: blend(parseFloat(w.headshotPct), match.hs,   n).toFixed(1) + '%',
        bodyPct:     blend(parseFloat(w.bodyPct),     match.body, n).toFixed(1) + '%',
        legsPct:     blend(parseFloat(w.legsPct),     match.legs, n).toFixed(1) + '%',
      };
    });
  }
  return [...weapons, {
    weapon:      match.weapon,
    type:        WEAPON_TYPES[match.weapon] ?? '',
    kills:       match.kills,
    headshotPct: match.hs   + '%',
    bodyPct:     match.body + '%',
    legsPct:     match.legs + '%',
  }].slice(0, 5);
};

// ─────────────────────────────────────────────
const PlayerProfileView = () => {
  const [player,        setPlayer]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [error,         setError]         = useState(null);
  const [playerId,      setPlayerId]      = useState(null);
  const [justUpdated,   setJustUpdated]   = useState(false);
  const [spinning,      setSpinning]      = useState(false);

  // modified function
  const handleSimulateMatch = async () => {
    if (!playerId) {
      setError('Player ID is missing');
      return;
    }

    setLoading(true);
    setSpinning(true);

    try {
      const response = await axios.put(
        `/api/matches/${playerId}/simulate-match`
      );

      const simulatedMatch = response.data.match;

      const mapResponse = await axios.get(
        `/api/maps/${simulatedMatch.map}`
      );
      const mapName = mapResponse.data.data.name;

      const adaptedMatch = adaptSimulatedMatch(simulatedMatch, playerId, mapName);

      // ← Re-fetch fresh stats from backend instead of manually blending
      const freshRes = await getPlayerStats(playerId);
      const raw = freshRes.data;

      setPlayer(prev => ({
        ...prev,
        // Updated computed stats from backend
        acs:             raw.acs ?? prev.acs,
        damagePerRound:  raw.damagePerRound ?? prev.damagePerRound,
        ddDeltaPerRound: raw.ddDeltaPerRound ?? prev.ddDeltaPerRound,
        kast:            raw.kast ? raw.kast + '%' : prev.kast,
        roundWinRate:    raw.roundWinPercentage ? raw.roundWinPercentage + '%' : prev.roundWinRate,
        killsPerRound:   raw.killsPerRound ?? prev.killsPerRound,
        kdRatio:         raw.kdRatio ?? prev.kdRatio,
        winRate:         raw.winRate ?? prev.winRate,
        headshotPercentage: raw.headshotPercentage ?? prev.headshotPercentage,
        bodyshotPercentage: raw.bodyshotPercentage ?? prev.bodyshotPercentage,
        legshotPercentage:  raw.legshotPercentage  ?? prev.legshotPercentage,
        matchesPlayed:   raw.matchesPlayed ?? prev.matchesPlayed,
        stats:           raw.stats ?? prev.stats,
        // Add the adapted match to recent matches
        recentMatches: [adaptedMatch, ...(prev.recentMatches || [])],
      }));

      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    } catch (err) {
      console.error(err);
      setError('Failed to simulate match');
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) return;

        const { _id } = JSON.parse(stored);
        setPlayerId(_id); // Store it in the state for later use

        const res = await getPlayerStats(_id); // ← use new endpoint
        const raw = res.data;

const adapted = {
  ...raw,

  // Field renames / reshapes
  team:     raw.teamId?.teamName ?? 'No Team',
  peakRank: raw.rank,
  peakRR:   raw.rr,

// Computed stats from backend
  ddDeltaPerRound: raw.ddDeltaPerRound ?? 'N/A',
  roundWinRate:    raw.roundWinPercentage ? raw.roundWinPercentage + '%' : 'N/A',
  kast:            raw.kast ? raw.kast + '%' : 'N/A',
  acs:             raw.acs ?? 'N/A',
  damagePerRound:  raw.damagePerRound ?? 'N/A',
  killsPerRound:   raw.killsPerRound  ?? 'N/A',
  roles:           [],

  topWeapons: (raw.topWeapons ?? []).map(w => {
    const total = (w.headshotKills ?? 0) + (w.bodyshotKills ?? 0) + (w.legshotKills ?? 0);
    return {
      weapon:      w.weapon?.name ?? 'Unknown',
      type:        w.weapon?.type ?? '',
      kills:       w.totalKills ?? 0,
      headshotPct: total ? ((w.headshotKills / total) * 100).toFixed(1) + '%' : '0%',
      bodyPct:     total ? ((w.bodyshotKills  / total) * 100).toFixed(1) + '%' : '0%',
      legsPct:     total ? ((w.legshotKills   / total) * 100).toFixed(1) + '%' : '0%',
    };
  }),

  topAgents: (raw.topAgents ?? []).map(a => ({
    name:    a.agent?.name ?? 'Unknown',
    hours:   'N/A',
    matches: a.matchesPlayed ?? 0,
    winRate: a.matchesPlayed ? ((a.wins / a.matchesPlayed) * 100).toFixed(1) + '%' : '0%',
    kd:      a.deaths === 0 ? a.kills : (a.kills / a.deaths).toFixed(2),
    acs:     'N/A',
  })),

  topMaps: (raw.topMaps ?? []).map(m => ({
      map:     m.map?.name ?? 'Unknown',
      wins:    m.wins ?? 0,
      losses:  m.losses ?? 0,
      winRate: m.matchesPlayed ? ((m.wins / m.matchesPlayed) * 100).toFixed(1) + '%' : '0%',
    })),

    recentMatches: (raw.last20Matches ?? []).map(m => {
      const matchPlayer = (m.match?.players ?? []).find(
        p => p.player?.toString() === raw._id?.toString()
      );
      const s = matchPlayer?.stats ?? {};
      const totalHits = (s.headshots ?? 0) + (s.bodyshots ?? 0) + (s.legshots ?? 0);

      return {
        date:      m.match?.datePlayed ? new Date(m.match.datePlayed).toLocaleDateString() : 'N/A',
        map:       m.match?.map?.name ?? 'N/A',
        result:    m.result === 'Win' ? 'W' : 'L',
        score:     m.match?.score ? `${m.match.score.teamA}:${m.match.score.teamB}` : 'N/A',
        kills:     s.kills   ?? 'N/A',
        deaths:    s.deaths  ?? 'N/A',
        assists:   s.assists ?? 'N/A',
        kd:        s.deaths  ? (s.kills / s.deaths).toFixed(2) : s.kills ?? 'N/A',
        kda:       s.kills != null ? `${s.kills}/${s.deaths}/${s.assists}` : 'N/A',
        hs:        totalHits ? ((s.headshots / totalHits) * 100).toFixed(1) : 'N/A',
        ddDelta:   s.damageDealt != null && s.damageTaken != null
                    ? s.damageDealt - s.damageTaken : 'N/A',
        acs:       'N/A',
        placement: 'N/A',
        isWin:     m.result === 'Win',
      };
    }),
  };

      setPlayer(adapted);
      } catch (err) {
        console.error('Failed to fetch player:', err);
        setError('Failed to fetch player data');
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    fetchPlayer();
  }, []); // Run once on component mount

  const adaptSimulatedMatch = (match, playerId, mapName) => {
    const playerData = match.players.find(p => p.player === playerId); // get stats for the current player

    return {
      date: new Date(match.datePlayed).toLocaleDateString(), // format date
      map: mapName, // now use the mapName directly
      result: match.result.winningTeam === playerData.team ? 'W' : 'L', // W for win, L for loss
      score: `${match.score.teamA}-${match.score.teamB}`, // team A vs team B score
      kd: (playerData.stats.kills / (playerData.stats.deaths || 1)).toFixed(2), // kills/deaths ratio
      kda: ((playerData.stats.kills + playerData.stats.assists) / (playerData.stats.deaths || 1)).toFixed(2), // (kills + assists) / deaths
      ddDelta: playerData.stats.damageDealt - playerData.stats.damageTaken, // damage delta
      hs: ((playerData.stats.headshots / (playerData.stats.totalHits || 1)) * 100).toFixed(1), // headshot percentage
      acs: playerData.stats.damageDealt, // average combat score (ACS)
      placement: 'N/A', // or 'MVP' if you have logic for determining MVP
    };
  };

  if (loading) return <div style={{ color: '#fff', padding: 40 }}>Loading...</div>;
  if (!player)  return <div style={{ color: '#fff', padding: 40 }}>No player data found.</div>;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.body}>

        {/* ── PROFILE BANNER ── */}
        <div style={styles.profileBanner}>
          <div style={styles.bannerLeft}>
            <img
              src={player.imageURL || '/default-avatar.png'}
              alt={player.username}
              style={styles.bannerAvatar}
              onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
            />
            <div>
              <div style={styles.bannerName}>{player.username}</div>
              <div style={styles.bannerTag}>{player.role}</div>
              <div style={styles.bannerMeta}>
                <span style={styles.metaBadge}>{player.team}</span>
                <span style={styles.metaBadge}>LVL {player.level}</span>
                <span style={styles.metaBadge}>{player.matchesPlayed} matches</span>
              </div>
            </div>
          </div>
          <div style={styles.bannerRank}>
            <div style={{ fontSize: 11, color: '#555', letterSpacing: 2, marginBottom: 4 }}>CURRENT RANK</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: rankColor(player.rank), letterSpacing: 2 }}>{player.rank}</div>
            <div style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>{player.rr} <span style={{ fontSize: 12, color: '#555' }}>RR</span></div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Peak: {player.peakRank} {player.peakRR} RR</div>
          </div>
        </div>

        {/* ── STAT CARDS ROW ── */}
        <div style={styles.statCardsRow}>
          {[
            { label: 'K/D RATIO',  value: player.kdRatio,                sub: 'Top 9.0%'  },
            { label: 'WIN RATE',   value: player.winRate,                 sub: `${player.stats.wins}W - ${player.stats.losses}L` },
            { label: 'ACS',        value: player.acs,                     sub: 'Top 7.0%'  },
            { label: 'HEADSHOT %', value: player.headshotPercentage + '%', sub: 'Top 3.1%' },
            { label: 'DMG/ROUND',  value: player.damagePerRound,          sub: 'Top 7.0%'  },
            { label: 'KAST',       value: player.kast,                    sub: 'Top 19.0%' },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statCardLabel}>{s.label}</div>
              <div style={styles.statCardValue}>{s.value}</div>
              <div style={styles.statCardSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── DETAILED STATS GRID ── */}
        <div style={styles.sectionTitle}><TrendingUp size={14} color="#ff4655" style={{ marginRight: 8 }} />DETAILED STATS</div>
        <div style={styles.detailGrid}>
          {[
            { label: 'Kills',          value: player.stats.kills         },
            { label: 'Deaths',         value: player.stats.deaths        },
            { label: 'Assists',        value: player.stats.assists       },
            { label: 'KAD Ratio',      value: player.kadRatio            },
            { label: 'Kills/Round',    value: player.killsPerRound       },
            { label: 'First Bloods',   value: player.stats.firstBloods   },
            { label: 'Flawless Rounds',value: player.stats.flawlessRounds},
            { label: 'Aces',           value: player.stats.aces          },
            { label: 'DD∆/Round',      value: player.ddDeltaPerRound     },
            { label: 'Round Win %',    value: player.roundWinRate        },
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
              { zone: 'Head', pct: player.headshotPercentage + '%', color: '#ff4655' },
              { zone: 'Body', pct: player.bodyshotPercentage + '%', color: '#38bdf8' },
              { zone: 'Legs', pct: player.legshotPercentage  + '%', color: '#888'    },
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
                    <td style={styles.miniTd}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{a.name}</div>
                      <div style={{ fontSize: 10, color: '#555' }}>{a.hours}h</div>
                    </td>
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
                <tr key={i} style={styles.matchRow}>
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
            <div style={styles.successMsg}>✓ Match simulated — all stats updated!</div>
          )}
          <button
            style={{ ...styles.simulateBtn, opacity: spinning ? 0.7 : 1 }}
            onClick={handleSimulateMatch}
            disabled={spinning}
          >
            <RefreshCw size={15} style={{ marginRight: 8, animation: spinning ? 'spin 0.8s linear infinite' : 'none' }} />
            {spinning ? 'SIMULATING MATCH...' : 'SIMULATE NEW MATCH'}
          </button>
          <p style={styles.simulateNote}>Dev tool — simulates a completed match and blends all stats</p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0d14',
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
    color: '#ccc',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: 60, background: '#0f1117',
    borderBottom: '1px solid #1a1f2e', position: 'sticky', top: 0, zIndex: 10,
  },
  body: { padding: '28px 40px' },
  profileBanner: {
    background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10,
    padding: '24px 28px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  bannerLeft:   { display: 'flex', alignItems: 'center', gap: 20 },
  bannerAvatar: { width: 72, height: 72, borderRadius: '50%', border: '3px solid #ff4655', objectFit: 'cover' },
  bannerName:   { fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  bannerTag:    { fontSize: 13, color: '#555', letterSpacing: 1, marginBottom: 8 },
  bannerMeta:   { display: 'flex', gap: 8, flexWrap: 'wrap' },
  metaBadge: {
    background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.2)',
    borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#888', letterSpacing: 1,
  },
  bannerRank: { textAlign: 'right' },
  statCardsRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 },
  statCard:      { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '14px 12px', textAlign: 'center' },
  statCardLabel: { fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 6 },
  statCardValue: { fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 },
  statCardSub:   { fontSize: 10, color: '#ff4655', marginTop: 4, letterSpacing: 1 },
  sectionTitle: {
    display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700,
    color: '#555', letterSpacing: 2, marginBottom: 10, marginTop: 20,
  },
  detailGrid:  { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 },
  detailItem:  { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '12px 14px' },
  detailLabel: { fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 4 },
  detailValue: { fontSize: 18, fontWeight: 900, color: '#fff' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  card:      { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '18px 20px' },
  cardTitle: { display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 14 },
  accuracyRow:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  accuracyLabel:  { fontSize: 12, color: '#666', width: 36 },
  accuracyBarWrap:{ flex: 1, height: 6, background: '#1a1f2e', borderRadius: 3, overflow: 'hidden' },
  accuracyBar:    { height: '100%', borderRadius: 3, transition: 'width 0.4s' },
  accuracyPct:    { fontSize: 12, fontWeight: 700, width: 40, textAlign: 'right' },
  roleRow: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a1f2e', paddingBottom: 10, marginBottom: 10 },
  miniTable: { width: '100%', borderCollapse: 'collapse' },
  miniTh: { fontSize: 10, color: '#555', letterSpacing: 1, textAlign: 'left', paddingBottom: 8, fontWeight: 700 },
  miniTd: { fontSize: 13, color: '#888', padding: '8px 0', borderBottom: '1px solid #1a1f2e' },
  mapRow: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a1f2e', padding: '10px 0' },
  weaponsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 },
  weaponCard:   { background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '18px 20px' },
  weaponKills:  { fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 },
  weaponAccRow: { display: 'flex', gap: 12, fontSize: 12, fontWeight: 700 },
  matchTh: { fontSize: 10, color: '#555', letterSpacing: 1, textAlign: 'left', paddingBottom: 10, fontWeight: 700 },
  matchTd: { fontSize: 13, color: '#888', padding: '10px 0', borderBottom: '1px solid #1a1f2e' },
  matchRow: { transition: 'background 0.15s' },
  simulateSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0 20px', gap: 10 },
  successMsg:  { fontSize: 13, color: '#22c55e', letterSpacing: 2, fontWeight: 700 },
  simulateBtn: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.3)',
    color: '#ff4655', borderRadius: 8, padding: '12px 28px',
    fontSize: 13, fontWeight: 900, letterSpacing: 2, cursor: 'pointer',
    fontFamily: "'Barlow Condensed', sans-serif", transition: 'background 0.2s',
  },
  simulateNote: { fontSize: 11, color: '#333', letterSpacing: 1 },
};

export default PlayerProfileView;
