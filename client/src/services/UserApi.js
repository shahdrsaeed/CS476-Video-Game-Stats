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

export const getUser = (id) => {
  return axios.get(`/api/users/${id}`);
};

export const getAllPlayers = (search = '') => {
  return axios.get(`/api/players${search ? `?search=${search}` : ''}`);
};
