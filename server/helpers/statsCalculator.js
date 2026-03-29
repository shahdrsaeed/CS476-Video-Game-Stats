// statsCalculator.js

/**
 * Calculate Round Win Percentage
 * @param {Object} player - Player document with populated last20Matches.match.rounds
 * @returns {String} round win % as string with 2 decimals
 */
const calculateRoundWinPercentage = (player) => {
  let roundsWon = 0;
  let roundsPlayed = 0;

  player.last20Matches.forEach(entry => {
    const match = entry.match;
    if (!match || !match.rounds) return;

    match.rounds.forEach(round => {
      const p = round.players.find(rp => rp.player.toString() === player._id.toString());
      if (!p) return;

      roundsPlayed++;
      if (p.team === round.winningTeam) roundsWon++;
    });
  });

  if (roundsPlayed === 0) return "0";
  return ((roundsWon / roundsPlayed) * 100).toFixed(2);
};

/**
 * Calculate KAST %
 * @param {Object} player - Player document
 * @returns {String} KAST % as string with 2 decimals
 */
const calculateKAST = (player) => {
  let kastRounds = 0;
  let totalRounds = 0;

  player.last20Matches.forEach(entry => {
    const match = entry.match;
    if (!match || !match.rounds) return;

    match.rounds.forEach(round => {
      const p = round.players.find(rp => rp.player.toString() === player._id.toString());
      if (!p) return;

      totalRounds++;
      if (p.kills > 0 || p.assists > 0 || p.survived || p.traded) {
        kastRounds++;
      }
    });
  });

  if (totalRounds === 0) return "0";
  return ((kastRounds / totalRounds) * 100).toFixed(2);
};

/**
 * Calculate Damage Delta per Round
 * @param {Object} player - Player document
 * @returns {String} average DD delta per round
 */
const calculateDDDeltaPerRound = (player) => {
  let totalDelta = 0;
  let totalRounds = 0;

  player.last20Matches.forEach(entry => {
    const match = entry.match;
    if (!match || !match.rounds) return;

    match.rounds.forEach(round => {
      const p = round.players.find(rp => rp.player.toString() === player._id.toString());
      if (!p) return;

      totalRounds++;
      totalDelta += (p.damageDealt - p.damageTaken);
    });
  });

  if (totalRounds === 0) return "0";
  return (totalDelta / totalRounds).toFixed(2);
};

/**
 * Calculate ACS over last 20 matches
 * @param {Object} player - Player document with populated last20Matches.match
 * @returns {String} average ACS as string with 2 decimals
 */
const calculateACS = (player) => {
  let totalDamage = 0;
  let totalRounds = 0;

  player.last20Matches.forEach(entry => {
    const match = entry.match;
    if (!match || !match.rounds) return;

    match.rounds.forEach(round => {
      const p = round.players.find(rp => rp.player.toString() === player._id.toString());
      if (!p) return;

      totalRounds++;
      totalDamage += p.damageDealt;
    });
  });

  if (totalRounds === 0) return '0.00';
  return (totalDamage / totalRounds).toFixed(2);
};

/**
 * Calculate top 3 agents by win rate over last 20 matches
 * @param {Object} player
 * @returns {Array}
 */
const calculateTopAgents = (player) => {
  const agentData = {};

  player.last20Matches.forEach(entry => {
    const match = entry.match;
    if (!match || !match.players) return;

    const matchPlayer = match.players.find(mp => mp.player.equals(player._id));
    if (!matchPlayer || !matchPlayer.agent) return;

    const agentId = matchPlayer.agent.toString();

    if (!agentData[agentId]) {
      agentData[agentId] = { agent: agentId, matchesPlayed: 0, wins: 0, losses: 0, kills: 0, deaths: 0, assists: 0};
    }

    agentData[agentId].matchesPlayed++;
    agentData[agentId].kills += matchPlayer.stats.kills;
    agentData[agentId].deaths += matchPlayer.stats.deaths;
    agentData[agentId].assists += matchPlayer.stats.assists;

    if (entry.result === 'Win') agentData[agentId].wins++;
    else agentData[agentId].losses++;
  });

  return Object.values(agentData)
    .sort((a, b) => {
      const aWr = a.wins / (a.matchesPlayed || 1);
      const bWr = b.wins / (b.matchesPlayed || 1);
      return bWr - aWr;
    })
    .slice(0, 3);
};

/**
 * Calculate top 3 maps by win rate over last 20 matches
 * @param {Object} player
 * @returns {Array} 
 */
const calculateTopMaps = (player) => {
  const mapData = {};

  player.last20Matches.forEach(entry => {
    const match = entry.match;
    if (!match || !match.map) return;

    const mapId = match.map.toString();

    if (!mapData[mapId]) {
      mapData[mapId] = { map: mapId, matchesPlayed: 0, wins: 0, losses: 0 };
    }

    mapData[mapId].matchesPlayed++;

    if (entry.result === 'Win') mapData[mapId].wins++;
    else mapData[mapId].losses++;
  });

  return Object.values(mapData)
    .sort((a, b) => {
      const aWR = a.wins / (a.matchesPlayed || 1);
      const bWR = b.wins / (b.matchesPlayed || 1);
      return bWR - aWR;
    })
    .slice(0, 3);
};

/**
 * Calculate top 3 weapons by kills over last 20 matches
 * @param {Object} player
 * @returns {Array}
 */
const calculateTopWeapons = (player) => {
  const weaponData = {};

  player.last20Matches.forEach(entry => {
    const match = entry.match;
    if (!match || !match.players) return;

    const matchPlayer = match.players.find(mp => mp.player.equals(player._id));
    if (!matchPlayer || !matchPlayer.topWeapons) return;

    matchPlayer.topWeapons.forEach(w => {
      const weaponId = w.weapon.toString();

      if (!weaponData[weaponId]) {
        weaponData[weaponId] = { weapon: weaponId, totalKills: 0, headshotKills: 0, bodyshotKills: 0, legshotKills: 0 };
      }

      weaponData[weaponId].totalKills += w.totalKills;
      weaponData[weaponId].headshotKills += w.headshotKills;
      weaponData[weaponId].bodyshotKills += w.bodyshotKills;
      weaponData[weaponId].legshotKills += w.legshotKills;
    });
  });

  return Object.values(weaponData)
    .sort((a, b) => b.totalKills - a.totalKills)
    .slice(0, 3);
};

module.exports = {
  calculateRoundWinPercentage,
  calculateKAST,
  calculateDDDeltaPerRound,
  calculateACS,
  calculateTopAgents,
  calculateTopMaps,
  calculateTopWeapons
};