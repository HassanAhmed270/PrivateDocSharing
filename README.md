# PrivateAI Agent - Initial Project Skeleton

Minimal foundation for the PrivateAI Agent project. This repository contains a Node/Express backend (ES modules) connected to MongoDB and a Vite + React client scaffold.

This commit is a one-time setup on main. Four feature branches should be created from main and implement features independently:
- feat/roles-requests
- feat/agent
- feat/encryption
- feat/frontend

Important: This initial skeleton deliberately does NOT implement authentication, users, roles, AI agent logic, encryption, or any feature code. It provides a clean foundation only.

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

- Run in development mode (uses nodemon)
  npm run dev

- Start (production)
  npm start

Health check

GET http://localhost:5000/api/health

Response:
{
  "success": true,
  "message": "PrivateAI Agent API is running"
}

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
- server/.env is included here as a placeholder but should not be committed in a real project; .gitignore prevents it from being tracked.

If you are the lead engineer running this for the team, confirm you have pushed this commit to main and notify the team that they can branch off now.