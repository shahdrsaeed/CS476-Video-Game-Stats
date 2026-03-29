import { useState, useEffect } from 'react';
import { getCoach, getUser, getCoachPlayers } from '../services/UserApi'; // ← removed getTeam

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
          const coachRes = await getCoach(_id);
          const coachData = coachRes.data;

          setCoach({
            ...coachData,
            teamName: coachData.teamId?.teamName ?? 'No Team'
          });

          const playersRes = await getCoachPlayers(_id);
          setTopTeams(playersRes.data);

        } else if (role === 'Player') {
          const playerRes = await getUser(_id);
          const playerData = playerRes.data;

          if (playerData.coach) {
            const coachRes = await getCoach(playerData.coach);
            const coachData = coachRes.data;

            setCoach({
              ...coachData,
              teamName: coachData.teamId?.teamName ?? 'No Team'
            });

            const playersRes = await getCoachPlayers(playerData.coach);
            setTopTeams(playersRes.data);
          }
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