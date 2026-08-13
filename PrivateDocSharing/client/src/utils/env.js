const fallbackUrl = 'http://localhost:5000';
const fallbackOrganizationEmailDomain = 'techtitanas.com';

export function getRuntimeConfig() {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || fallbackUrl,
    socketUrl: import.meta.env.VITE_SOCKET_URL || fallbackUrl,
    organizationEmailDomain:
      import.meta.env.VITE_ORGANIZATION_EMAIL_DOMAIN || fallbackOrganizationEmailDomain,
  };
}
