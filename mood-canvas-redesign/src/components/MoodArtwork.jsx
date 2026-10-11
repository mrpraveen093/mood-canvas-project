import { buildArtworkSVG } from '../lib/artwork.js';

export default function MoodArtwork({ emotions = {}, seed = 'mood', className = '' }) {
  const svg = buildArtworkSVG(emotions, seed);
  return <div className={`artwork ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
