export const USER_ROLES = {
  OWNER: 'owner',
  REVIEWER: 'reviewer',
  MEMBER: 'member',
};

export const OWNER_REVIEWER_ROLES = [USER_ROLES.OWNER, USER_ROLES.REVIEWER];

export function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

export function isRoleAllowed(role, allowedRoles = []) {
  if (!allowedRoles.length) {
    return true;
  }

  return allowedRoles.map(normalizeRole).includes(normalizeRole(role));
}
