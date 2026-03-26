import { COACH_DATA, TEAMS_LIST, REGISTRATION_REQUESTS } from '../data/mockData';

export const useGeneralData = () => {
  return {
    coach: COACH_DATA || {}, 
    topTeams: TEAMS_LIST || [], 
    requests: REGISTRATION_REQUESTS || []
  };
};