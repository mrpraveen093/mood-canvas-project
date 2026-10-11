import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import MoodArtwork from '../components/MoodArtwork.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { EMOTIONS, EMOTION_MAP } from '../lib/emotions.js';

const SIZE = 360;
const CENTER = SIZE / 2;
const RADIUS = 130;
const POINTS = EMOTIONS.length;

function point(index, radius) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / POINTS;
  return [CENTER + Math.cos(angle) * radius, CENTER + Math.sin(angle) * radius];
}

export default function MoodDNA() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .analytics('all')
      .then((data) => active && setStats(data))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <div className="notice notice-error" role="alert">{error}</div>;
  if (!stats) return <PageLoader />;

  if (stats.total === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <span className="eyebrow">Mood DNA</span>
            <h1>Your emotional fingerprint</h1>
          </div>
        </header>
        <div className="empty">
          <h3>Nothing to fingerprint yet.</h3>
          <p>Write a few reflections and your average emotional profile will take shape here.</p>
          <Link to="/studio" className="btn btn-primary btn-sm">Open the studio</Link>
        </div>
      </div>
    );
  }

  const polygon = EMOTIONS.map((e, i) => {
    const value = Math.min(100, stats.averageScores[e.key] || 0);
    return point(i, RADIUS * (value / 100)).join(',');
  }).join(' ');

  const dominantKey = EMOTIONS.reduce(
    (best, e) => ((stats.averageScores[e.key] || 0) > (stats.averageScores[best.key] || 0) ? e : best),
    EMOTIONS[0],
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Mood DNA</span>
          <h1>Your emotional fingerprint</h1>
          <p className="muted">
            Based on {stats.total} reflection{stats.total === 1 ? '' : 's'}. Your strongest average tone is{' '}
            <strong style={{ color: EMOTION_MAP[dominantKey.key].color }}>{dominantKey.label}</strong>.
          </p>
        </div>
      </header>

      <div className="dna-grid">
        <div className="card dna-chart-card">
          <div className="dna-panel-head">
            <span className="eyebrow">SEVEN DIMENSIONS</span>
            <h2>Your emotional fingerprint</h2>
            <p className="muted small">A shape made from the feelings you name most.</p>
          </div>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="radar" role="img" aria-label="Average emotion profile radar chart">
            {[25, 50, 75, 100].map((pct) => (
              <polygon
                key={pct}
                className="ring"
                points={EMOTIONS.map((_, i) => point(i, (RADIUS * pct) / 100).join(',')).join(' ')}
              />
            ))}
            {EMOTIONS.map((_, i) => {
              const [x, y] = point(i, RADIUS);
              return <line key={i} className="axis" x1={CENTER} y1={CENTER} x2={x} y2={y} />;
            })}
            <polygon className="shape" points={polygon} />
            {EMOTIONS.map((e, i) => {
              const value = Math.min(100, stats.averageScores[e.key] || 0);
              const [x, y] = point(i, RADIUS * (value / 100));
              return <circle key={e.key} cx={x} cy={y} r="4.5" fill={e.color} />;
            })}
            {EMOTIONS.map((e, i) => {
              const [x, y] = point(i, RADIUS + 26);
              return (
                <text key={e.key} className="label" x={x} y={y} textAnchor="middle" dominantBaseline="middle">
                  {e.label}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="card dna-art-card">
          <div className="dna-panel-head">
            <span className="eyebrow">YOUR MOOD ART</span>
            <h2>A portrait of your patterns.</h2>
          </div>
          <MoodArtwork className="dna-artwork" emotions={stats.averageScores} seed={`dna-${user.id}`} />
          <p className="muted small center" style={{ marginTop: '1rem' }}>
            This artwork is generated from your average profile and stays consistent for your account.
          </p>
        </div>
      </div>
    </div>
  );
}
