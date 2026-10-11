import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import emotionRoutes from './routes/emotions.js';
import moodRoutes from './routes/moods.js';

const { MONGO_URI, JWT_SECRET } = process.env;
const PORT = Number(process.env.PORT) || 5000;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI. Copy server/.env.example to server/.env and set it.');
  process.exit(1);
}
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set and at least 32 characters long.');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/moods', moodRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.code === 11000) return res.status(409).json({ message: 'That record already exists' });
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
  res.status(status).json({ message: err.expose ? err.message : 'Invalid request' });
});

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Mood Canvas API listening on http://127.0.0.1:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start API:', err.message);
  process.exit(1);
});
