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
const calcualteACS = (player) => {
  let totalDamage = 0;
  let totalRounds = 0;

  player.last20Matches.forEach(entry => {
    const match = entry.match;
    if (!match || !match.rounds) return;

    match.rounds.forEach(round => {
      const p = round.players.find(rp => rp.player.toString() === player._id.toString());
      if (!p) return;

      totalRounds++;
      totalDamage += damageDealt;
    });
  });

  if (totalRounds === 0) return '0.00';
  return (totalDamage / totalRounds).toFixed(2);
};

module.exports = {
  calculateRoundWinPercentage,
  calculateKAST,
  calculateDDDeltaPerRound,
  calculateACS
};