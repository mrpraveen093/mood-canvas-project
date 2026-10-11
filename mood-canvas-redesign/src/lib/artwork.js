import { EMOTIONS, NEUTRAL } from './emotions.js';

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a deterministic SVG portrait from emotion percentages.
 * The same emotions + seed always produce the same artwork.
 */
export function buildArtworkSVG(emotions = {}, seed = 'mood', size = 600) {
  const rand = mulberry32(hashString(String(seed)));
  const active = EMOTIONS
    .map((e) => ({ ...e, value: Math.max(0, Number(emotions?.[e.key]) || 0) }))
    .filter((e) => e.value > 0);

  const shapes = [];
  if (active.length === 0) {
    [0.22, 0.34, 0.46].forEach((r, i) => {
      shapes.push(
        `<circle cx="${size / 2}" cy="${size / 2}" r="${(size * r).toFixed(1)}" fill="none" stroke="${NEUTRAL.color}" stroke-width="2" opacity="${(0.5 - i * 0.12).toFixed(2)}"/>`,
      );
    });
  } else {
    for (const emotion of active) {
      const count = Math.min(9, 2 + Math.round(emotion.value / 12));
      for (let i = 0; i < count; i++) {
        const r = size * (0.07 + (emotion.value / 100) * 0.2) * (0.6 + rand() * 0.8);
        const cx = size * (0.12 + rand() * 0.76);
        const cy = size * (0.12 + rand() * 0.76);
        const opacity = 0.35 + rand() * 0.4;
        shapes.push(
          `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${emotion.color}" opacity="${opacity.toFixed(2)}"/>`,
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Generated mood artwork">
  <defs>
    <radialGradient id="mc-bg" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#1d1f2e"/>
      <stop offset="100%" stop-color="#0a0b10"/>
    </radialGradient>
    <filter id="mc-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${(size * 0.045).toFixed(1)}"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#mc-bg)"/>
  <g filter="url(#mc-soft)">${shapes.join('')}</g>
</svg>`;
}

export function downloadArtwork(emotions, seed) {
  const svg = buildArtworkSVG(emotions, seed);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mood-canvas-${seed}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
