# PrivateAI Agent — Complete Application

A privacy-first, multi-tenant document workspace with encrypted document storage, document-request workflows, notifications, and a guarded AI agent.

## 1. Architecture

```text
Browser / React + Vite
        |
        | REST / JSON + multipart upload
        v
Express API
        |
        +--> JWT authentication
        +--> Organization / tenant isolation
        +--> Document encryption (AES-256-GCM)
        +--> Document request workflow
        +--> External recipient access
        +--> Notifications + audit history
        +--> PrivateAI Agent + Gemini
        |
        v
     MongoDB
```

Documents are encrypted before their persistent storage record is created. The API never returns encryption IV/auth-tag metadata or the encrypted storage path.

## 2. Project structure

```text
PrivateDocSharing/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/       # API integration layer
│   │   └── utils/
│   ├── .env.example
│   └── package.json
│
└── ../server/               # Express + MongoDB backend
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   ├── utils/
    │   └── validators/
    ├── uploads/
    ├── .env.example
    └── package.json
```

## 3. Requirements

- Node.js 20+
- npm
- MongoDB 7+ (local or Atlas)
- A Gemini API key for AI-agent commands
- A 64-character hexadecimal AES-256 encryption key

## 4. Backend setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Backend environment

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

Generate a key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env`.

## 5. Frontend setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The Vite frontend normally runs on `http://localhost:5173`.

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_ORGANIZATION_EMAIL_DOMAIN=techtitanas.com
```

The API client automatically sends the stored JWT as:

```text
Authorization: Bearer <token>
```

## 6. First-user flow

1. Open `/register`.
2. Enter name, organization name, organization email and password.
3. The frontend calls `POST /api/auth/register`.
4. The returned token is used to call `POST /api/organizations`.
5. The organization owner is promoted to `admin`.
6. The frontend stores the authenticated session.
7. The user can now upload documents and use organization-scoped endpoints.

## 7. Main frontend workflow

```text
Register
  ↓
Create Organization
  ↓
Dashboard
  ├── Documents
  │     ├── Upload
  │     ├── Metadata
  │     ├── Download/decrypt
  │     └── Archive
  │
  ├── Requests
  │     ├── Create request
  │     ├── Review
  │     ├── Discussion
  │     ├── Accept / Reject
  │     ├── Sign
  │     ├── Complete / Cancel
  │     └── Audit history
  │
  ├── Notifications
  │
  └── PrivateAI Agent
        ├── Guardrails
        ├── Intent validation
        ├── Permission checks
        ├── Real document/request execution
        └── Gemini document discussion
```

# 8. API reference

Base URL:

```text
http://localhost:5000
```

Unless marked **Public**, the endpoint requires a JWT. Endpoints under organizations, documents, requests, external recipients, notifications and agent also require the authenticated user to belong to an organization.

## Health

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | No | API status |
| GET | `/api/health` | No | Health check |

## Authentication

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Alice",
  "email": "alice@techtitanas.com",
  "password": "password123"
}
```

Returns a JWT and user profile.

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "alice@techtitanas.com",
  "password": "password123"
}
```

### Current user

```http
GET /api/auth/me
Authorization: Bearer <token>
```

Returns the authenticated user.

## Organizations

### Create organization

```http
POST /api/organizations
Authorization: Bearer <token>
```

```json
{
  "name": "Acme Secure Workspace"
}
```

The creator becomes the organization `admin`.

### Get my organization

```http
GET /api/organizations
Authorization: Bearer <token>
```

Returns organization details and populated members.

### Get organization members

```http
GET /api/organizations/members
Authorization: Bearer <token>
```

Returns members available for internal document requests.

## Documents

### Upload document

```http
POST /api/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Multipart fields:

```text
file        required, max 10 MB
name        required
description optional
```

Supported types include PDF, DOC/DOCX, TXT/Markdown/CSV/JSON/XML/HTML and PNG/JPEG.

The upload is written temporarily to `uploads/`, encrypted with AES-256-GCM, and the plaintext file is removed.

### List documents

```http
GET /api/documents
Authorization: Bearer <token>
```

Users receive documents they uploaded plus documents accessible through their active requests.

### Get document metadata

```http
GET /api/documents/:id
Authorization: Bearer <token>
```

Encryption metadata and storage paths are intentionally excluded.

### Download/decrypt document

```http
GET /api/documents/:id?download=true
Authorization: Bearer <token>
```

The server decrypts the file in memory and streams the plaintext response. Decrypted bytes are not written back to disk.

### Archive document

```http
PATCH /api/documents/:id/archive
Authorization: Bearer <token>
```

## Document requests

### Create internal request

```http
POST /api/document-requests
Authorization: Bearer <token>
```

```json
{
  "documentId": "<document-id>",
  "recipientType": "internal",
  "recipientId": "<user-id>",
  "message": "Please review and sign this document."
}
```

### Create external request

```json
{
  "documentId": "<document-id>",
  "recipientType": "external",
  "externalRecipientId": "<external-recipient-id>",
  "message": "Please review this document."
}
```

### List requests

```http
GET /api/document-requests
Authorization: Bearer <token>
```

Returns requests visible to the current organization/user.

### Get request

```http
GET /api/document-requests/:id
Authorization: Bearer <token>
```

### Audit history

```http
GET /api/document-requests/:id/history
Authorization: Bearer <token>
```

### Review

```http
PATCH /api/document-requests/:id/review
Authorization: Bearer <token>
```

Moves a recipient's `pending` request to `in_review`.

### Discuss

```http
PATCH /api/document-requests/:id/discuss
Authorization: Bearer <token>
```

```json
{
  "comment": "Please clarify section 4 before signing."
}
```

Moves the request to `discussion`.

### Accept

```http
PATCH /api/document-requests/:id/accept
Authorization: Bearer <token>
```

### Reject

```http
PATCH /api/document-requests/:id/reject
Authorization: Bearer <token>
```

```json
{
  "comment": "I cannot approve this version."
}
```

### Sign

```http
PATCH /api/document-requests/:id/sign
Authorization: Bearer <token>
```

A request must be `accepted` before it can be signed.

### Complete

```http
PATCH /api/document-requests/:id/complete
Authorization: Bearer <token>
```

The sender completes a request after it has been signed.

### Cancel

```http
PATCH /api/document-requests/:id/cancel
Authorization: Bearer <token>
```

The sender can cancel an active request.

## External recipients

### Create external recipient

```http
POST /api/external-recipients
Authorization: Bearer <token>
```

```json
{
  "name": "External Reviewer",
  "email": "reviewer@example.com",
  "company": "Example Ltd",
  "phone": "+1..."
}
```

### List active external recipients

```http
GET /api/external-recipients
Authorization: Bearer <token>
```

### Get external recipient

```http
GET /api/external-recipients/:id
Authorization: Bearer <token>
```

### Deactivate external recipient

```http
PATCH /api/external-recipients/:id/deactivate
Authorization: Bearer <token>
```

### Generate external access

```http
POST /api/document-requests/:id/external-access
Authorization: Bearer <token>
```

Returns a temporary access URL and expiry time.

## Public external request access

These endpoints do **not** use JWT. Access is controlled by the generated, hashed, expiring external token.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/document-requests/public/:token` | Open external request |
| PATCH | `/api/document-requests/public/:token` | Open/activate external request |
| PATCH | `/api/document-requests/public/:token/review` | External review |
| PATCH | `/api/document-requests/public/:token/accept` | External accept |
| PATCH | `/api/document-requests/public/:token/reject` | External reject |
| PATCH | `/api/document-requests/public/:token/sign` | External sign |
| PATCH | `/api/document-requests/public/:token/complete` | External complete |

## Notifications

### List notifications

```http
GET /api/notifications
Authorization: Bearer <token>
```

### Mark notification as read

```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

## PrivateAI Agent

### Command

```http
POST /api/agent/command
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "message": "Show my pending requests"
}
```

Supported agent actions:

```text
SEND_DOCUMENT
SHOW_PENDING_REQUESTS
SHOW_DOCUMENT_STATUS
FIND_DOCUMENTS_UNDER_DISCUSSION
VIEW_DOCUMENT_FOR_DISCUSSION
```

The execution path is:

```text
JWT
 ↓
Organization check
 ↓
Rate limit
 ↓
Input guardrails
 ↓
Gemini intent interpretation
 ↓
Intent validation
 ↓
Agent guardrails
 ↓
Permission check
 ↓
Real database/service execution
 ↓
Audit log
 ↓
Response
```

For `VIEW_DOCUMENT_FOR_DISCUSSION`, the document must belong to the current organization and be linked to an authorized request in `in_review` or `discussion`. The decrypted text is limited before it is sent to Gemini.

## 9. Security model

- JWT authentication
- Organization/tenant isolation
- Role model: `admin` and `user`
- AES-256-GCM document encryption
- Encrypted storage metadata hidden from API clients
- No decrypted files persisted to disk
- Agent prompt-injection guardrails
- Agent intent validation
- Agent action permissions
- Agent rate limiting
- Agent audit logging
- External access tokens stored hashed with expiry
- Helmet security headers
- CORS enabled for frontend integration

## 10. Tests

Backend unit/security tests:

```bash
cd server
npm test
```

Current result after integration:

```text
13 tests
13 passed
0 failed
```

The tests cover:

- Agent prompt-injection guardrails
- Request-ID validation
- Cross-organization metadata protection
- Document-text length limits
- Forbidden agent actions
- AES-256-GCM round-trip
- Ciphertext tampering
- Authentication-tag tampering
- Missing encryption key
- Valid agent actions
- Invalid agent actions
- Malformed intent fields

### API endpoint smoke check

The backend can also be checked against a running instance for route/auth contracts. Full database-backed workflow testing requires MongoDB to be running and a valid Gemini key for successful AI commands.

## 11. Production build

Frontend:

```bash
cd client
npm run build
```

Backend:

```bash
cd server
npm start
```

Use a production MongoDB URI, strong JWT secret, strong encryption key, HTTPS, and a restricted CORS origin before deployment.

## 12. Important integration notes

The frontend is now connected to the backend's actual API contract.

The old demo/mock fallbacks were removed from:

- authentication
- document listing/upload
- document requests
- request status updates
- notifications
- agent commands

The old `/api/requests` endpoints were replaced with the real `/api/document-requests` workflow.

The frontend agent sends `{ "message": "..." }`, matching the backend contract. The agent backend executes the validated action itself; the frontend no longer performs a second fake confirmation call.

Document upload uses a real multipart request. The backend parses the upload, encrypts the file, and stores only the encrypted document.

The request detail page uses the real workflow endpoints instead of nonexistent message/signature endpoints.
