import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Mood from '../models/Mood.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanName = (value) => String(value ?? '').trim();
const cleanEmail = (value) => String(value ?? '').trim().toLowerCase();
const cleanPassword = (value) => String(value ?? '');

function passwordError(password) {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 200) return 'Password must be 200 characters or fewer';
  return null;
}

router.post('/signup', async (req, res) => {
  const name = cleanName(req.body.name);
  const email = cleanEmail(req.body.email);
  const password = cleanPassword(req.body.password);

  if (!name || name.length > 80) return res.status(400).json({ message: 'Please enter a name up to 80 characters' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email address' });
  const pwError = passwordError(password);
  if (pwError) return res.status(400).json({ message: pwError });

  if (await User.exists({ email })) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ token: signToken(user._id, user.tokenVersion), user: user.toPublic() });
});

router.post('/login', async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = cleanPassword(req.body.password);

  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) return res.status(401).json({ message: 'Incorrect email or password' });

  res.json({ token: signToken(user._id, user.tokenVersion), user: user.toPublic() });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Account not found' });
  res.json({ user: user.toPublic() });
});

router.patch('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Account not found' });

  if (req.body.name !== undefined) {
    const name = cleanName(req.body.name);
    if (!name || name.length > 80) return res.status(400).json({ message: 'Please enter a name up to 80 characters' });
    user.name = name;
  }

  if (req.body.email !== undefined) {
    const email = cleanEmail(req.body.email);
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email address' });
    if (email !== user.email && (await User.exists({ email }))) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    user.email = email;
  }

  await user.save();
  res.json({ user: user.toPublic() });
});

router.patch('/me/password', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('+passwordHash');
  if (!user) return res.status(401).json({ message: 'Account not found' });

  const currentPassword = cleanPassword(req.body.currentPassword);
  const newPassword = cleanPassword(req.body.newPassword);

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(403).json({ message: 'Current password is incorrect' });
  }
  const pwError = passwordError(newPassword);
  if (pwError) return res.status(400).json({ message: pwError });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await User.updateOne(
    { _id: user._id },
    { $set: { passwordHash }, $inc: { tokenVersion: 1 } },
  );
  res.json({ message: 'Password updated' });
});

router.delete('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('+passwordHash');
  if (!user) return res.status(401).json({ message: 'Account not found' });

  if (!(await bcrypt.compare(cleanPassword(req.body.password), user.passwordHash))) {
    return res.status(403).json({ message: 'Password is incorrect' });
  }

  await Mood.deleteMany({ user: user._id });
  await user.deleteOne();
  res.status(204).end();
});

export default router;
