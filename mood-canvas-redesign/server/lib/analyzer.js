import { EMOTION_KEYS } from './emotions.js';

/*
 * Local, keyword-based emotion analyzer. No external AI service is called.
 * Recognizes common word forms (e.g. "stressed", "worried"), multi-word phrases,
 * and ignores emotion cues that follow a negation within the previous few words.
 */

const LEXICON = {
  joy: ['happy', 'happiness', 'joy', 'joyful', 'excited', 'excitement', 'glad', 'cheerful', 'delighted', 'elated', 'great', 'wonderful', 'amazing', 'fantastic', 'awesome', 'smile', 'smiling', 'laugh', 'laughing', 'fun', 'proud', 'thrilled', 'content', 'playful'],
  calm: ['calm', 'peaceful', 'relaxed', 'relax', 'serene', 'quiet', 'tranquil', 'centered', 'grounded', 'rested', 'steady', 'balanced', 'gentle', 'mellow'],
  love: ['love', 'loved', 'loving', 'caring', 'grateful', 'thankful', 'appreciate', 'warm', 'affection', 'tender', 'adore', 'cherish', 'connected', 'fond'],
  sadness: ['sad', 'down', 'unhappy', 'lonely', 'cry', 'crying', 'tearful', 'hurt', 'heartbroken', 'grief', 'miserable', 'empty', 'depressed', 'blue', 'disappointed', 'hopeless', 'sorrow', 'gloomy'],
  anxiety: ['anxious', 'anxiety', 'worried', 'worry', 'nervous', 'stressed', 'stress', 'scared', 'afraid', 'fear', 'panic', 'overwhelmed', 'tense', 'uneasy', 'dread', 'restless'],
  anger: ['angry', 'anger', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'frustration', 'resentful', 'rage', 'upset', 'bitter', 'hate', 'livid'],
  tiredness: ['tired', 'exhausted', 'drained', 'sleepy', 'fatigued', 'weary', 'burnout', 'lethargic', 'sluggish', 'spent', 'drowsy'],
};

const PHRASES = [
  { words: ['over', 'the', 'moon'], emotion: 'joy' },
  { words: ['look', 'forward', 'to'], emotion: 'joy' },
  { words: ['at', 'peace'], emotion: 'calm' },
  { words: ['on', 'edge'], emotion: 'anxiety' },
  { words: ['fed', 'up'], emotion: 'anger' },
  { words: ['worn', 'out'], emotion: 'tiredness' },
  { words: ['burnt', 'out'], emotion: 'tiredness' },
  { words: ['burned', 'out'], emotion: 'tiredness' },
  { words: ['falling', 'apart'], emotion: 'sadness' },
];

const NEGATORS = new Set([
  'not', 'no', 'never', 'none', 'nothing', 'without', 'hardly', 'barely',
  "don't", "doesn't", "didn't", "isn't", "wasn't", "aren't", "weren't", "can't", "won't",
]);
const NEGATION_WINDOW = 3;
const SUFFIXES = ['ing', 'ed', 'ness', 'ful', 'ly', 'es', 's'];

const WORD_INDEX = new Map();
for (const [emotion, words] of Object.entries(LEXICON)) {
  for (const word of words) WORD_INDEX.set(word, emotion);
}

function lookupWord(token) {
  if (WORD_INDEX.has(token)) return WORD_INDEX.get(token);
  if (token.endsWith('ied') && token.length >= 5) {
    const stem = `${token.slice(0, -3)}y`;
    if (WORD_INDEX.has(stem)) return WORD_INDEX.get(stem);
  }
  for (const suffix of SUFFIXES) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 3) {
      const stem = token.slice(0, -suffix.length);
      if (WORD_INDEX.has(stem)) return WORD_INDEX.get(stem);
      if (WORD_INDEX.has(`${stem}e`)) return WORD_INDEX.get(`${stem}e`);
    }
  }
  return null;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function isNegated(tokens, index) {
  for (let j = Math.max(0, index - NEGATION_WINDOW); j < index; j++) {
    if (NEGATORS.has(tokens[j])) return true;
  }
  return false;
}

export function analyzeReflection(text) {
  const tokens = tokenize(String(text ?? ''));
  const counts = Object.fromEntries(EMOTION_KEYS.map((key) => [key, 0]));
  const cues = [];

  for (let i = 0; i < tokens.length; ) {
    const phrase = PHRASES.find((p) => p.words.every((word, k) => tokens[i + k] === word));
    if (phrase) {
      if (!isNegated(tokens, i)) {
        counts[phrase.emotion] += 1;
        cues.push(phrase.words.join(' '));
      }
      i += phrase.words.length;
      continue;
    }
    const emotion = lookupWord(tokens[i]);
    if (emotion && !isNegated(tokens, i)) {
      counts[emotion] += 1;
      cues.push(tokens[i]);
    }
    i += 1;
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  if (total === 0) {
    return {
      emotions: Object.fromEntries(EMOTION_KEYS.map((key) => [key, 0])),
      dominantEmotion: 'neutral',
      cues: [],
    };
  }

  const emotions = Object.fromEntries(
    EMOTION_KEYS.map((key) => [key, Math.round((counts[key] / total) * 100)]),
  );
  const dominantEmotion = EMOTION_KEYS.reduce(
    (best, key) => (counts[key] > counts[best] ? key : best),
    EMOTION_KEYS[0],
  );

  return { emotions, dominantEmotion, cues: [...new Set(cues)] };
}
