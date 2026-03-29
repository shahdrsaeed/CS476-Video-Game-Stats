const mongoose = require('mongoose');
const Player = require('../models/Player');
const Match = require('../models/submodel/Match');

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

/* 
const applyMatchToPlayers = async (match) => {
    for (const p of match.players) {
        const player = await Player.findById(p.player).session(session); // session included so read is scoped into transaction

        if (!player) continue;

        // Update stats

        player.stats.kills += p.stats.kills;
        player.stats.deaths += p.stats.deaths;
        player.stats.assists += p.stats.assists;

        player.stats.headshots += p.stats.headshots;
        player.stats.bodyshots += p.stats.bodyshots;
        player.stats.legshots += p.stats.legshots;

        player.stats.firstBloods += p.stats.firstBloods;
        player.stats.firstDeaths += p.stats.firstDeaths; 
        player.stats.aces += p.stats.aces;
        player.stats.flawlessRounds += p.stats.flawlessRounds

        // Win/loss update
        const didWin = match.result.winningTeam === p.team;

        if (didWin) 
            player.stats.wins += 1;
        else
            player.stats.losses += 1;

        // Add to last 20 matches
        player.addMatch ({
            match: match._id,
            result: didWin ? 'Win' : 'Loss'
        });

        await player.save({session}); // session included so write is scoped into transaction
    }
};
*/

const applyMatchToPlayers = async (match, session) => {  // ← add session param
    for (const p of match.players) {
        const player = await Player.findById(p.player).session(session);

        if (!player) continue;

        // REMOVED: player.stats.roundsPlayed — field doesn't exist in your schema

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
module.exports = { createMatch, getMatch, applyMatchToPlayers };