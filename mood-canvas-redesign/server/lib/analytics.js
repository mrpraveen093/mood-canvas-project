import { EMOTION_KEYS } from './emotions.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

/**
 * @param {Array} entries  all of the user's entries: { id, createdAt, emotions, dominantEmotion }
 * @param {'7'|'30'|'90'|'all'} days
 */
export function buildAnalytics(entries, days, now = new Date()) {
  const cutoff = days === 'all' ? null : new Date(now.getTime() - Number(days) * DAY_MS);
  const inRange = cutoff ? entries.filter((e) => new Date(e.createdAt) >= cutoff) : entries;

  const emotionCounts = Object.fromEntries(['neutral', ...EMOTION_KEYS].map((k) => [k, 0]));
  const sums = Object.fromEntries(EMOTION_KEYS.map((k) => [k, 0]));

  for (const entry of inRange) {
    emotionCounts[entry.dominantEmotion] = (emotionCounts[entry.dominantEmotion] || 0) + 1;
    for (const key of EMOTION_KEYS) sums[key] += Number(entry.emotions?.[key]) || 0;
  }

  const total = inRange.length;
  const averageScores = Object.fromEntries(
    EMOTION_KEYS.map((k) => [k, total ? Math.round(sums[k] / total) : 0]),
  );

  const topEntry = EMOTION_KEYS
    .map((k) => [k, emotionCounts[k]])
    .sort((a, b) => b[1] - a[1])[0];
  const dominantEmotion = total && topEntry[1] > 0 ? topEntry[0] : null;

  const seriesLength = days === 'all' ? 30 : Number(days);
  const countsByDay = new Map();
  for (const entry of inRange) {
    const key = dayKey(entry.createdAt);
    countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
  }
  const daily = Array.from({ length: seriesLength }, (_, i) => {
    const date = dayKey(now.getTime() - (seriesLength - 1 - i) * DAY_MS);
    return { date, count: countsByDay.get(date) || 0 };
  });

  const activeDays = new Set(entries.map((e) => dayKey(e.createdAt)));
  const today = dayKey(now);
  const yesterday = dayKey(now.getTime() - DAY_MS);
  let cursor = activeDays.has(today) ? today : activeDays.has(yesterday) ? yesterday : null;
  let streak = 0;
  while (cursor && activeDays.has(cursor)) {
    streak += 1;
    cursor = dayKey(new Date(cursor).getTime() - DAY_MS);
  }

  const latestEntry = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const latest = latestEntry
    ? { id: latestEntry.id, dominantEmotion: latestEntry.dominantEmotion, createdAt: latestEntry.createdAt }
    : null;

  return {
    range: days,
    total,
    emotionCounts,
    averageScores,
    dominantEmotion,
    daily,
    streak,
    latest,
  };
}
