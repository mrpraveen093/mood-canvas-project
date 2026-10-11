import { Router } from 'express';
import mongoose from 'mongoose';
import Mood, { toMoodEntry } from '../models/Mood.js';
import { requireAuth } from '../middleware/auth.js';
import { buildAnalytics } from '../lib/analytics.js';
import { EMOTION_KEYS } from '../lib/emotions.js';

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;
const RANGES = ['7', '30', '90', 'all'];
const EMOTION_FILTERS = [...EMOTION_KEYS, 'neutral'];

router.use(requireAuth);

const parseRange = (value, fallback) => (RANGES.includes(value) ? value : fallback);
const rangeFilter = (days) =>
  days === 'all' ? {} : { createdAt: { $gte: new Date(Date.now() - Number(days) * DAY_MS) } };
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isValidId = (id) => mongoose.isValidObjectId(id);

// GET /api/moods — paginated, filterable history
router.get('/', async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const days = parseRange(req.query.days, 'all');

  const filter = { user: req.userId, ...rangeFilter(days) };
  if (EMOTION_FILTERS.includes(req.query.emotion)) filter.dominantEmotion = req.query.emotion;

  const search = String(req.query.search ?? '').trim().slice(0, 100);
  if (search) filter.description = { $regex: escapeRegExp(search), $options: 'i' };

  const sort = req.query.sort === 'oldest' ? 1 : -1;

  const [docs, total] = await Promise.all([
    Mood.find(filter).sort({ createdAt: sort }).skip((page - 1) * limit).limit(limit).lean(),
    Mood.countDocuments(filter),
  ]);

  res.json({
    items: docs.map(toMoodEntry),
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
  });
});

// GET /api/moods/analytics — counts, averages, daily activity, streak
router.get('/analytics', async (req, res) => {
  const days = parseRange(req.query.days, '30');
  const docs = await Mood.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .select('description createdAt emotions dominantEmotion')
    .lean();
  res.json(buildAnalytics(docs.map(toMoodEntry), days));
});

// GET /api/moods/gallery — saved artwork
router.get('/gallery', async (req, res) => {
  const docs = await Mood.find({ user: req.userId, inGallery: true }).sort({ createdAt: -1 }).lean();
  res.json({ items: docs.map(toMoodEntry) });
});

// PATCH /api/moods/:id/gallery — save or remove a canvas
router.patch('/:id/gallery', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Reflection not found' });
  if (typeof req.body.inGallery !== 'boolean') {
    return res.status(400).json({ message: 'inGallery must be true or false' });
  }

  const doc = await Mood.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { inGallery: req.body.inGallery },
    { new: true },
  ).lean();
  if (!doc) return res.status(404).json({ message: 'Reflection not found' });

  res.json(toMoodEntry(doc));
});

// DELETE /api/moods/:id — delete one reflection
router.delete('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Reflection not found' });

  const doc = await Mood.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!doc) return res.status(404).json({ message: 'Reflection not found' });

  res.status(204).end();
});

export default router;
