export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const ADMIN_ROLES = [USER_ROLES.ADMIN];

export function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

export function isRoleAllowed(role, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  return allowedRoles.map(normalizeRole).includes(normalizeRole(role));
}
