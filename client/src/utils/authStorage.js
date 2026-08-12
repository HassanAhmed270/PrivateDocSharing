import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from '../services/api.js';

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function pickStoredUserFields(user) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const id = user.id ?? user._id ?? user.userId ?? null;
  const name = user.name ?? user.fullName ?? '';
  const role = user.role ?? null;
  const organizationId =
    user.organizationId ?? user.orgId ?? user.organization?._id ?? user.organization?.id ?? null;

  return {
    id,
    name,
    role,
    organizationId,
  };
}

export function getStoredUser() {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function storeSession({ token, user }) {
  if (!canUseBrowserStorage() || !token) {
    return;
  }

  const safeUser = pickStoredUserFields(user);

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);

  if (safeUser) {
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(safeUser));
  } else {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }
}

export function clearSessionStorage() {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}
