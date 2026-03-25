import axios from 'axios';

export const registerUser = (data) => {
  return axios.post('/api/users/register', data);
};

export const loginUser = (data) => {
  return axios.post('/api/users/login', data);
};

export const getUser = (id) => {
  return axios.get(`/api/users/${id}`);
};