import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing = false;
let queue = [];

function onRefreshed(token) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const isRefreshCall = original?.url?.includes('/auth/refresh') || original?.config?.url?.includes('/auth/refresh');
    const isAuthCall = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register');

    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshCall) {
        setAccessToken(null);
        return Promise.reject(err);
      }
      if (isAuthCall) {
        return Promise.reject(err);
      }
      if (refreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      original._retry = true;
      refreshing = true;
      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        setAccessToken(data.accessToken);
        onRefreshed(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        queue = [];
        setAccessToken(null);
        if (!refreshErr.config?.url?.includes('/auth/refresh')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(err);
  }
);
