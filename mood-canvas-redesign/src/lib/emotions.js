export const EMOTIONS = [
  { key: 'joy', label: 'Joy', color: '#F5B841' },
  { key: 'calm', label: 'Calm', color: '#5FB8B0' },
  { key: 'love', label: 'Love', color: '#E8799A' },
  { key: 'sadness', label: 'Sadness', color: '#6B8FD1' },
  { key: 'anxiety', label: 'Anxiety', color: '#A88BF0' },
  { key: 'anger', label: 'Anger', color: '#E8694A' },
  { key: 'tiredness', label: 'Tiredness', color: '#9AA88F' },
];

export const NEUTRAL = { key: 'neutral', label: 'Neutral', color: '#9CA3AF' };

export const EMOTION_KEYS = EMOTIONS.map((e) => e.key);

export const EMOTION_MAP = Object.fromEntries([...EMOTIONS, NEUTRAL].map((e) => [e.key, e]));

export const FILTER_EMOTIONS = [...EMOTIONS, NEUTRAL];

export const RANGE_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: 'all', label: 'All time' },
];
