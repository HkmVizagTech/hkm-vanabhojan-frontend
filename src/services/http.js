import axios from 'axios';
import { API_URL } from '../config/env';
import { session } from '../utils/session';

export const http = axios.create({ baseURL: API_URL, timeout: 30000 });

let onUnauthorized = null;
/** AuthProvider registers a handler so an expired session logs the user out everywhere. */
export const setUnauthorizedHandler = handler => {
  onUnauthorized = handler;
};

http.interceptors.request.use(config => {
  const token = session.getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if ((status === 401 || status === 403) && hadToken && !error.config?.skipAuthRedirect) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

/** Best human-readable message from an axios/Error failure. */
export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  (error?.code === 'ERR_NETWORK' ? 'Network error, please try again.' : null) ||
  error?.message ||
  fallback;

/** Admin list endpoints answer with a bare array or one of several wrapper keys. */
export const unwrapList = (data, keys = ['candidates', 'records']) => {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
};
