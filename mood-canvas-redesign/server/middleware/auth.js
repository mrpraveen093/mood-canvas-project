import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function signToken(userId, tokenVersion = 0) {
  return jwt.sign({ sub: String(userId), ver: tokenVersion }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please sign in to continue' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }

  if (typeof payload !== 'object' || typeof payload.sub !== 'string' || !Number.isSafeInteger(payload.ver)) {
    return res.status(401).json({ message: 'Please sign in to continue' });
  }

  const user = await User.findById(payload.sub).select('tokenVersion');
  if (!user || user.tokenVersion !== payload.ver) {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }

  req.userId = payload.sub;
  return next();
}
