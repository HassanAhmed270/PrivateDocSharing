import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';
import { generateToken, normalizeEmail, toSafeUser } from '../utils/auth.js';

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('normalizeEmail trims and lowercases email addresses', () => {
  assert.equal(normalizeEmail('  Owner@Example.COM  '), 'owner@example.com');
});

test('bcrypt hashing stores a non-plaintext password and compare validates it', async () => {
  const plaintext = 'correct horse battery staple';
  const hash = await bcrypt.hash(plaintext, 12);

  assert.notEqual(hash, plaintext);
  assert.match(hash, /^\$2[aby]\$/);
  assert.equal(await bcrypt.compare(plaintext, hash), true);
  assert.equal(await bcrypt.compare('wrong password', hash), false);
});

test('safe user serialization never exposes password fields', () => {
  const safeUser = toSafeUser({
    _id: { toString: () => 'user-id' },
    name: 'Owner',
    email: 'owner@example.com',
    password: 'stored-hash',
    role: 'owner',
    organizationId: { toString: () => 'org-id' },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  });

  assert.equal(safeUser.id, 'user-id');
  assert.equal(safeUser.organizationId, 'org-id');
  assert.equal(Object.hasOwn(safeUser, 'password'), false);
  assert.equal(Object.hasOwn(safeUser, 'passwordHash'), false);
});

test('generateToken signs JWT with userId, role, and organizationId', () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '1h';

  const token = generateToken({
    _id: { toString: () => 'user-id' },
    role: 'owner',
    organizationId: { toString: () => 'org-id' },
  });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  assert.equal(decoded.userId, 'user-id');
  assert.equal(decoded.role, 'owner');
  assert.equal(decoded.organizationId, 'org-id');
});

test('protect attaches identity when a valid bearer token is provided', async () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign(
    { userId: 'user-id', role: 'owner', organizationId: 'org-id' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
  const req = { get: () => `Bearer ${token}` };
  const res = createMockResponse();
  let nextCalled = false;

  protect(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { userId: 'user-id', role: 'owner', organizationId: 'org-id' });
});

test('protect rejects missing, invalid, and expired bearer tokens with 401', async () => {
  process.env.JWT_SECRET = 'test-secret';

  for (const authorization of [
    '',
    'Bearer not-a-real-token',
    `Bearer ${jwt.sign({ userId: 'user-id', role: 'owner', organizationId: 'org-id' }, process.env.JWT_SECRET, { expiresIn: '-1s' })}`,
  ]) {
    const req = { get: () => authorization };
    const res = createMockResponse();
    let nextCalled = false;

    protect(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
  }
});
