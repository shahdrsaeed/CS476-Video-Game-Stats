const mongoose = require('mongoose');
const Player = require('../models/Player');
const Match = require('../models/submodel/Match');
const { PlayerSubject, PlayerSocketObserver, PlayerStatsLogger } = require('../observers');

const createMatch = async (req, res) => {
    // start a mongoDB session, groups multiple DB operations into a single transaction
    const session = await mongoose.startSession(); 
    session.startTransaction(); 

    try {
        // due to session pass, match.create needs array syntax
        const [match] = await Match.create([req.body], {session});
        // pass session to function so every player within it is part of the same transaction
        await applyMatchToPlayers(match, session);

        // commit both match inserts and all player stat updates to the database together
        await session.commitTransaction();

        res.status(201).json ({
            success: true,
            data: match
        });
    } catch (err) {
        // Rolls back both the match insert and all player stat updates if something fails
        // leaves DB exactly as it was before request
        await session.abortTransaction();

        res.status(400).json ({
            success: false,
            error: err.message
        });
    } finally {
        // Always release the session regardless of outcome
        session.endSession();
    }
};

const getMatch = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await Match.findById(id)
        .populate('players.player') // populate player info
        .populate('map');

        if (!match) {
            return res.status(404).json({ success: false, error: 'Match not found' });
        }

        res.status(200).json ({
            success: true,
            data: match
        });
    } catch (err) {
        res.status(500).json ({
            success: false,
            error: err.message
        });
    }
};

const applyMatchToPlayers = async (match, session) => {
    for (const p of match.players) {
        const player = await Player.findById(p.player).session(session);

        if (!player) continue;

        player.stats.kills += p.stats.kills;
        player.stats.deaths += p.stats.deaths;
        player.stats.assists += p.stats.assists;
        player.stats.headshots += p.stats.headshots;
        player.stats.bodyshots += p.stats.bodyshots;
        player.stats.legshots += p.stats.legshots;
        player.stats.firstBloods += p.stats.firstBloods;
        player.stats.firstDeaths += p.stats.firstDeaths;
        player.stats.aces += p.stats.aces;
        player.stats.flawlessRounds += p.stats.flawlessRounds;

        const didWin = match.result.winningTeam === p.team;
        if (didWin) player.stats.wins += 1;
        else player.stats.losses += 1;

        player.addMatch({
            match: match._id,
            result: didWin ? 'Win' : 'Loss'
        });

        await player.save({ session });
    }
};

const simulateMatch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const player = await Player.findById(req.params.id).session(session);

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const subject = new PlayerSubject(player);

    const statsLogger = new PlayerStatsLogger();
    const socketObserver = new PlayerSocketObserver(global.io);

    subject.attach(statsLogger);
    subject.attach(socketObserver);

    const s = stat => (player.stats[stat] || 0);

    const matchStats = {
      kills:          s('kills')          + Math.floor(Math.random() * 20),
      deaths:         s('deaths')         + Math.floor(Math.random() * 15),
      assists:        s('assists')        + Math.floor(Math.random() * 20),
      damageDealt:    s('damageDealt')    + Math.floor(Math.random() * 500),
      damageTaken:    s('damageTaken')    + Math.floor(Math.random() * 300),
      headshots:      s('headshots')      + Math.floor(Math.random() * 5),
      bodyshots:      s('bodyshots')      + Math.floor(Math.random() * 10),
      legshots:       s('legshots')       + Math.floor(Math.random() * 3),
      firstBloods:    s('firstBloods')    + (Math.random() > 0.5 ? 1 : 0),
      firstDeaths:    s('firstDeaths')    + (Math.random() > 0.5 ? 1 : 0),
      aces:           s('aces')           + (Math.random() > 0.8 ? 1 : 0),
      flawlessRounds: s('flawlessRounds') + (Math.random() > 0.7 ? 1 : 0),
    };

    const teams = ['A', 'B'];
    const team = teams[Math.floor(Math.random() * teams.length)];
    const didWin = Math.random() > 0.5;
    const winningTeam = didWin ? team : (team === 'A' ? 'B' : 'A');

    const mapId = "69c98c2c1650185c3c8d8cae";

    const newMatch = new Match({
      players: [{
        player: player._id,
        stats: matchStats,
        team
      }],
      result: { winningTeam },
      rounds: [],
      map: mapId
    });

    await newMatch.save({ session });

    Object.keys(matchStats).forEach(stat => {
      player.stats[stat] = s(stat) + matchStats[stat] - s(stat);
    });

    if (didWin) player.stats.wins = (player.stats.wins || 0) + 1;
    else player.stats.losses = (player.stats.losses || 0) + 1;

    player.addMatch({
      match: newMatch._id,
      result: didWin ? 'Win' : 'Loss'
    });

    await player.save({ session });
    await session.commitTransaction();

    subject.updateStats(player.stats);

    res.status(200).json({
      success: true,
      newStats: player.stats,
      match: newMatch
    });

  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ message: 'Error simulating match', error: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = { createMatch, getMatch, applyMatchToPlayers, simulateMatch };
