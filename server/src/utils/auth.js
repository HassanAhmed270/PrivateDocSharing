import jwt from 'jsonwebtoken';

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function toSafeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId?.toString(),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function generateToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw Object.assign(new Error('JWT_SECRET is not configured'), { statusCode: 500 });
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      organizationId: user.organizationId.toString(),
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
  );
}
