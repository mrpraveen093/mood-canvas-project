import mongoose from 'mongoose';
import { EMOTION_KEYS } from '../lib/emotions.js';

const emotionPaths = Object.fromEntries(
  EMOTION_KEYS.map((key) => [key, { type: Number, default: 0, min: 0, max: 100 }]),
);

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  description: { type: String, required: true, maxlength: 5000 },
  emotions: emotionPaths,
  dominantEmotion: {
    type: String,
    enum: [...EMOTION_KEYS, 'neutral'],
    default: 'neutral',
  },
  cues: { type: [String], default: [] },
  inGallery: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
});

moodSchema.index({ user: 1, createdAt: -1 });

/** Converts a Mongoose document or lean object into the API response shape. */
export function toMoodEntry(doc) {
  const emotions = doc.emotions || {};
  const dominantEmotion = doc.dominantEmotion || 'neutral';
  return {
    id: String(doc._id),
    description: doc.description ?? '',
    emotions: Object.fromEntries(EMOTION_KEYS.map((key) => [key, Number(emotions[key]) || 0])),
    dominantEmotion,
    neutral: dominantEmotion === 'neutral',
    cues: doc.cues || [],
    inGallery: Boolean(doc.inGallery),
    createdAt: doc.createdAt,
  };
}

export default mongoose.model('Mood', moodSchema);
