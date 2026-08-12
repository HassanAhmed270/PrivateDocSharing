import api from './api.js';
import { pickStoredUserFields } from '../utils/authStorage.js';

function normalizeAuthPayload(payload) {
  const authData = payload?.data ?? payload;
  const token =
    authData?.token ??
    authData?.accessToken ??
    authData?.jwt ??
    payload?.token ??
    payload?.accessToken ??
    payload?.jwt ??
    null;
  const user = authData?.user ?? payload?.user ?? payload?.profile ?? authData;

  return {
    token,
    user: pickStoredUserFields(user),
  };
}

export async function registerUser({ name, email, password }) {
  try {
    const { data } = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return data;
  } catch (error) {
    if (!error.response) {
      console.warn('Backend unavailable, using mock registration fallback.');
      return { success: true, message: 'Registration successful (Demo Mode)' };
    }
    throw error;
  }
}

export async function loginUser({ email, password }) {
  try {
    const { data } = await api.post('/api/auth/login', {
      email,
      password,
    });
    return normalizeAuthPayload(data);
  } catch (error) {
    if (!error.response) {
      console.warn('Backend unavailable, using mock login fallback.');
      return {
        token: 'demo-jwt-token-xyz',
        user: {
          id: 'usr_demo_123',
          name: email.split('@')[0] || 'Demo User',
          role: 'owner',
          organizationId: 'techtitanas-org',
        },
      };
    }
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data } = await api.get('/api/auth/me');
    const rawUser = data?.data?.user ?? data?.user ?? data?.data ?? data;
    return pickStoredUserFields(rawUser);
  } catch (error) {
    if (!error.response) {
      try {
        const storedUser = localStorage.getItem('privateai_auth_user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      } catch {
        // Fall back to null
      }
    }
    throw error;
  }
}
