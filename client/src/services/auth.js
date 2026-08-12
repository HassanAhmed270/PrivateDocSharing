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
  const { data } = await api.post('/api/auth/register', {
    name,
    email,
    password,
  });

  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/api/auth/login', {
    email,
    password,
  });

  return normalizeAuthPayload(data);
}

export async function getCurrentUser() {
  const { data } = await api.get('/api/auth/me');
  const rawUser = data?.data?.user ?? data?.user ?? data?.data ?? data;

  return pickStoredUserFields(rawUser);
}
