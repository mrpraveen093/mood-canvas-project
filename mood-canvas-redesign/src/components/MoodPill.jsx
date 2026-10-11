import { EMOTION_MAP } from '../lib/emotions.js';

export default function MoodPill({ emotion }) {
  const meta = EMOTION_MAP[emotion] ?? EMOTION_MAP.neutral;
  return (
    <span className="pill" style={{ '--c': meta.color }}>
      <span className="dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}
