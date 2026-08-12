import axios from 'axios';
import { getRuntimeConfig } from '../utils/env.js';

export const AUTH_TOKEN_STORAGE_KEY = 'privateai_auth_token';
export const AUTH_USER_STORAGE_KEY = 'privateai_auth_user';

const { apiBaseUrl } = getRuntimeConfig();

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getStoredAuthToken() {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    // Ignore storage errors so the original API error can continue flowing.
  }
}

function notifyAuthError(status) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('privateai:auth-error', {
      detail: { status },
    }),
  );
}

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const isAlreadyOnLogin = window.location.pathname === '/login';

  if (!isAlreadyOnLogin) {
    window.location.assign(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      clearStoredSession();
      notifyAuthError(status);
      redirectToLogin();
    }

    if (status === 403) {
      notifyAuthError(status);
    }

    return Promise.reject(error);
  },
);

export default api;
