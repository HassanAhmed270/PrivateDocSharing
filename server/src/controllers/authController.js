import bcrypt from 'bcryptjs';
import Organization from '../models/Organization.js';
import User, { USER_ROLES } from '../models/User.js';
import { generateToken, normalizeEmail, toSafeUser } from '../utils/auth.js';

const BCRYPT_COST = 12;

export function buildNewOrganizationOwnerInput({ name, email }, organizationId, passwordHash) {
  return {
    name: name.trim(),
    email,
    password: passwordHash,
    role: USER_ROLES.OWNER,
    organizationId,
  };
}

function requireFields(fields) {
  const missing = Object.entries(fields)
    .filter(([, value]) => !String(value || '').trim())
    .map(([key]) => key);

  if (missing.length > 0) {
    const error = new Error(`Missing required field(s): ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
}

export async function register(req, res, next) {
  try {
    const { name, password, organizationName } = req.body;
    const email = normalizeEmail(req.body.email);

    requireFields({ name, email, password, organizationName });

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const organization = await Organization.create({ name: organizationName.trim() });
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    const user = await User.create(buildNewOrganizationOwnerInput({ name, email }, organization._id, passwordHash));

    organization.ownerId = user._id;
    await organization.save();

    const token = generateToken(user);

    return res.status(201).json({ success: true, user: toSafeUser(user), token });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = 'Email is already registered';
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    requireFields({ email, password });

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({ success: true, user: toSafeUser(user), token });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user: toSafeUser(user) });
  } catch (error) {
    return next(error);
  }
}
