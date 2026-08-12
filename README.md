# PrivateAI Agent Frontend

Stage 3 adds protected and role-based routing on top of authentication and the centralized API service for the PrivateAI Agent project.

## Stack

- Vite
- React
- JavaScript
- Tailwind CSS
- React Router DOM
- Axios
- React Hot Toast
- React Icons

## Project layout

```text
client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
└── package.json
```

## Environment

Copy the example file and adjust values for your backend:

```bash
cp client/.env.example client/.env
```

Required variables:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ORGANIZATION_EMAIL_DOMAIN=techtitanas.com
```

`client/.env` is intentionally ignored and must not be committed.

## Run locally

```bash
cd client
npm install
npm run dev
```

## Build

```bash
cd client
npm run build
```

## Central API service

All frontend API calls should use the single axios instance exported from:

```text
client/src/services/api.js
```

The instance reads `VITE_API_BASE_URL`, attaches `Authorization: Bearer <token>` from localStorage when present, clears local session data and redirects to `/login` on `401`, and emits a browser auth-error event for centralized `401/403` handling.

## Auth pages and session context

Implemented public routes/pages:

- `/register` calls `POST /api/auth/register` with name, email, and password.
- `/login` calls `POST /api/auth/login`, stores the JWT token plus minimal user fields only, and redirects after success.
- App startup rehydrates an existing token by calling `GET /api/auth/me`; invalid or expired tokens are cleared.
- Logout clears all frontend session storage.
- Logged-in users attempting to visit `/login` or `/register` are redirected to `/dashboard`.

Local storage is limited to:

- `privateai_auth_token`
- `privateai_auth_user` containing only `id`, `name`, `role`, and `organizationId`

`VITE_ORGANIZATION_EMAIL_DOMAIN` controls the client-side registration email-domain check. The backend remains the source of truth for registration authorization.

## Protected and role-based routing

Protected placeholder routes now exist for routing verification:

- `/dashboard`
- `/documents`
- `/documents/upload` — restricted to `owner` and `reviewer`
- `/requests`
- `/requests/:id`
- `/agent`

All protected routes verify the AuthContext session before rendering. Role-restricted routes check the stored minimal user role in addition to backend enforcement.

## Stage scope

This phase only adds the protected route shell, auth guard, role guard, and placeholder protected pages. Dashboard data, document flows, request workflows, signatures, agent chat behavior, and notifications are intentionally deferred to later stages.
