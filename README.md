# PrivateAI Agent - Initial Project Skeleton

Minimal foundation for the PrivateAI Agent project. This repository contains a Node/Express backend (ES modules) connected to MongoDB and a Vite + React client scaffold.

This commit is a one-time setup on main. Four feature branches should be created from main and implement features independently:
- feat/roles-requests
- feat/agent
- feat/encryption
- feat/frontend

The backend now includes the Stage 0 document-sharing foundation routes from the roles/requests workstream. Authentication is still intentionally lightweight for this phase: document APIs use an `x-user-id` header (or `actorId`) as the acting user placeholder until real auth lands.

Repository layout

private-ai-agent/
├── client/                # Vite + React frontend scaffold
├── server/                # Node/Express backend (ES modules)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env               # NOT committed to git (included here as local placeholder)
│   ├── .env.example
│   └── package.json
├── uploads/               # tracked directory for uploaded files (.gitkeep used)
├── .gitignore
└── README.md

Getting started (development)

1. Backend

- Change to the server folder
  cd server

- Install dependencies
  npm install

- Configure environment
  Copy .env.example to .env and set MONGODB_URI (the included .env has a placeholder). Example:

  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/privateai
  ENCRYPTION_KEY=replace-with-64-hex-character-aes-256-key

- Run in development mode (uses nodemon)
  npm run dev

- Run backend unit tests
  npm test

- Start (production)
  npm start

Health check

GET http://localhost:5000/api/health

Response:
{
  "success": true,
  "message": "PrivateAI Agent API is running"
}

Document routes

All document routes are mounted under `/api/documents`. Pass `x-user-id: <user-id>` for routes that require an acting user.

- `GET /api/documents` - list documents owned by or shared with the acting user
- `POST /api/documents` - create a document metadata record
- `GET /api/documents/:id` - fetch an accessible document
- `POST /api/documents/:id/requests` - request access for a user
- `PATCH /api/documents/:id/requests/:requestId` - owner approves or rejects a request

Example create request:

```bash
curl -X POST http://localhost:5000/api/documents \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: alice' \
  -d '{"title":"Project Plan","description":"Initial shared document"}'
```

2. Frontend

- Change to the client folder
  cd client

- Install dependencies
  npm install

- Run dev server
  npm run dev

Notes

- This is the shared foundation commit. Do NOT implement feature work on main. Branch from main and create feature branches named as agreed.
- The server is ES modules (package.json has "type": "module").
- server/.env is included here as a local placeholder but should not be committed; .gitignore ignores `*.env`.
- ENCRYPTION_KEY must be a 32-byte AES-256 key encoded as 64 hexadecimal characters. Keep the real value only in local environment files or secret managers.
- `server/src/utils/encryption.js` provides isolated AES-256-GCM `encryptBuffer(buffer)` and `decryptBuffer(ciphertext, iv, authTag)` helpers. These utilities are unit-tested but are not wired into document upload or retrieval routes yet.

If you are the lead engineer running this for the team, confirm you have pushed this commit to main and notify the team that they can branch off now.