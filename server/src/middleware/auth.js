import jwt from 'jsonwebtoken';

export function protect(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Authentication token is required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(Object.assign(new Error('JWT_SECRET is not configured'), { statusCode: 500 }));
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      organizationId: payload.organizationId,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}
