# PrivateAI Agent Backend

This is the Express/MongoDB backend for the PrivateAI document workspace.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Default API:

```text
http://localhost:5000
```

Run the unit/security suite:

```bash
npm test
```

## Environment

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/privateai_agent
JWT_SECRET=replace-with-a-long-random-jwt-secret
JWT_EXPIRES_IN=1d
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
ENCRYPTION_KEY=64_hex_characters
```

`ENCRYPTION_KEY` is 32 bytes represented as 64 hexadecimal characters.

## Source layout

```text
src/
├── config/          # DB, encryption and agent prompts
├── controllers/     # HTTP handlers
├── middleware/      # JWT, tenant, rate limit, upload parsing
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # document, request and agent business logic
├── utils/           # encryption helpers
└── validators/      # agent intent validation
```

## Endpoint map

```text
GET    /
GET    /api/health

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/organizations
GET    /api/organizations
GET    /api/organizations/members

POST   /api/documents
GET    /api/documents
GET    /api/documents/:id
PATCH  /api/documents/:id/archive

POST   /api/document-requests
GET    /api/document-requests
GET    /api/document-requests/:id
GET    /api/document-requests/:id/history
PATCH  /api/document-requests/:id/review
PATCH  /api/document-requests/:id/discuss
PATCH  /api/document-requests/:id/accept
PATCH  /api/document-requests/:id/reject
PATCH  /api/document-requests/:id/sign
PATCH  /api/document-requests/:id/complete
PATCH  /api/document-requests/:id/cancel
POST   /api/document-requests/:id/external-access

POST   /api/external-recipients
GET    /api/external-recipients
GET    /api/external-recipients/:id
PATCH  /api/external-recipients/:id/deactivate

GET    /api/document-requests/public/:token
PATCH  /api/document-requests/public/:token
PATCH  /api/document-requests/public/:token/review
PATCH  /api/document-requests/public/:token/accept
PATCH  /api/document-requests/public/:token/reject
PATCH  /api/document-requests/public/:token/sign
PATCH  /api/document-requests/public/:token/complete

GET    /api/notifications
PATCH  /api/notifications/:id/read

POST   /api/agent/command
```

See the root `PrivateDocSharing/README.md` for request bodies, workflow semantics and frontend integration.

## Document encryption

The upload flow is:

```text
multipart upload
      ↓
temporary file in uploads/
      ↓
AES-256-GCM encryption
      ↓
encrypted .enc file
      ↓
Document MongoDB record
      ↓
temporary plaintext removed
```

Downloads decrypt in memory and stream the plaintext response.

## Agent

`POST /api/agent/command` accepts:

```json
{
  "message": "Show my pending requests"
}
```

The command passes through authentication, tenant isolation, rate limiting, guardrails, intent validation and permission checks before execution. Agent actions are audited.

## Tests

```bash
npm test
```

Current suite:

```text
13 passed / 0 failed
```
