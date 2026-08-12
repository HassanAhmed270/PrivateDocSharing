Progress: feat/frontend — Central API Service (Stage 1)

Date: 2026-08-12

This update records Stage 1 work for the feat/frontend branch: adding a
single central axios instance for all frontend API calls as required by the
project roadmap. Stage 0 (Project Initialization) was previously completed.

What I changed in this stage
---------------------------
- Added client/src/services/api.js: a single axios instance with:
  - baseURL sourced from VITE_API_BASE_URL
  - request interceptor attaching Authorization: Bearer <token> from localStorage
    (tries token, accessToken, jwt keys)
  - response interceptor handling 401 (clears token and redirects to /login)
    and 403 (redirects to /unauthorized)

Notes and decisions
-------------------
- The token storage keys are conservative (token / accessToken / jwt) but
  per rules only non-sensitive data should be stored in localStorage. Passwords
  are never stored.
- No real endpoint calls were made in this stage — the file only creates the
  configured axios instance and exports it as default.
- Redirects on 401/403 are simple window.location.href navigations so they work
  without additional router context.

Files added
-----------
- client/src/services/api.js

Next steps for the developer
----------------------------
- Locally run: cd client && npm install && npm run dev
- Verify the app loads and that importing client/src/services/api.js does not
  cause runtime errors.
- Proceed to implement auth flows and pages in Stage 2 when ready.

Done — STOP
