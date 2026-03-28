/*import { COACH_DATA, TEAMS_LIST, REGISTRATION_REQUESTS } from '../data/mockData';

export const useGeneralData = () => {
  return {
    coach: COACH_DATA || {}, 
    topTeams: TEAMS_LIST || [], 
    requests: REGISTRATION_REQUESTS || []
  };
};
*/

/*
import { COACH_DATA, PLAYERS_LIST, REGISTRATION_REQUESTS } from '../data/mockData';

export const useGeneralData = () => {
  return {
    coach: COACH_DATA || {},
    topTeams: PLAYERS_LIST || [],
    players: PLAYERS_LIST || [],
    requests: REGISTRATION_REQUESTS || []
  };
};
*/

import { useState, useEffect } from 'react';
import { getCoach, getTeam, getUser } from '../services/UserApi';

export const useGeneralData = () => {
  const [coach, setCoach] = useState(null);
  const [topTeams, setTopTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) return;

        const { _id, role } = JSON.parse(stored);

        if (role === 'Coach') {
          // Coach: fetch their own profile + team
          const coachRes = await getCoach(_id);
          const coachData = coachRes.data;
          setCoach(coachData);

          if (coachData.teamId) {
            const teamRes = await getTeam(coachData.teamId);
            const teamData = teamRes.data;
            setCoach({ ...coachData, teamName: teamData.teamName });   // attach team name to coach so GeneralView can display it
            setTopTeams(teamRes.data.players ?? []);
          }

        } else if (role === 'Player') {
          // Player: fetch their own data first to get coach reference
          const playerRes = await getUser(_id);
          const playerData = playerRes.data;

          if (playerData.coach) {
            // Fetch the coach using the player's coach field
            const coachRes = await getCoach(playerData.coach);
            const coachData = coachRes.data;
            setCoach(coachData);

            // Fetch the coach's team
            if (coachData.teamId) {
              const teamRes = await getTeam(coachData.teamId);
              const teamData = teamRes.data;

              setCoach({ ...coachData, teamName: teamData.teamName });   // attach team name to coach so GeneralView can display it
              setTopTeams(teamRes.data.players ?? []);
            }
          }
          // if player.coach is null, coach stays null
          // GeneralView will show "No Coach" message
        }

      } catch (err) {
        console.error('Failed to fetch general data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { coach, topTeams, loading };
};