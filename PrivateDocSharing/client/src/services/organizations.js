import api from './api.js';

export async function createOrganization(name, token) {
  const { data } = await api.post(
    '/api/organizations',
    { name },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data?.data?.organization ?? data?.organization ?? data;
}

export async function getMyOrganization() {
  const { data } = await api.get('/api/organizations');
  return data?.data?.organization ?? data?.organization ?? data;
}

export async function getOrganizationMembers() {
  const { data } = await api.get('/api/organizations/members');
  return data?.data?.members ?? data?.members ?? [];
}
