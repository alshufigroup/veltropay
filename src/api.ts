import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.veltrobridge.xyz';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getWebSocketUrl = (accountNumber: string) => {
  const wsUrl = API_URL.replace('http', 'ws');
  return `${wsUrl}/ws/${accountNumber}`;
};
