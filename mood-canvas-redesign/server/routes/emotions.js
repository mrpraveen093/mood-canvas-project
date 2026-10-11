import { Router } from 'express';
import Mood, { toMoodEntry } from '../models/Mood.js';
import { requireAuth } from '../middleware/auth.js';
import { analyzeReflection } from '../lib/analyzer.js';

const router = Router();

router.post('/analyze', requireAuth, async (req, res) => {
  const description = String(req.body.description ?? '').trim();
  if (!description) return res.status(400).json({ message: 'Write a few words about how you feel' });
  if (description.length > 5000) {
    return res.status(400).json({ message: 'Reflections must be 5000 characters or fewer' });
  }

  const analysis = analyzeReflection(description);
  const mood = await Mood.create({
    user: req.userId,
    description,
    emotions: analysis.emotions,
    dominantEmotion: analysis.dominantEmotion,
    cues: analysis.cues,
  });

  res.status(201).json(toMoodEntry(mood.toObject()));
});

export default router;
