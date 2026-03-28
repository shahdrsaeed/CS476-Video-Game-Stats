import axios from 'axios';

export const createUser = (data) => {
  return axios.post('/api/users/create', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const loginUser = (data) => {
  return axios.post('/api/users/login', data);
};

// used in PlayerProfileView
export const getUser = (id) => {
  return axios.get(`/api/users/${id}`);
};

// used in TeamSearchView
export const getAllPlayers = (search = '') => {
  return axios.get(`/api/players${search ? `?search=${search}` : ''}`);
};

// used in GeneralView
export const getCoach = (id) => {
  return axios.get(`/api/users/${id}`);
};

// used in GeneralView
export const getTeam = (id) => {
  return axios.get(`/api/teams/${id}`);
};