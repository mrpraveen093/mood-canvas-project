import { useEffect, useState } from 'react';
import { Activity, Flame, Layers, Sparkles } from 'lucide-react';
import { api } from '../api.js';
import ActivityChart from '../components/ActivityChart.jsx';
import EmotionBars from '../components/EmotionBars.jsx';
import PageLoader from '../components/PageLoader.jsx';
import StatCard from '../components/StatCard.jsx';
import { EMOTION_KEYS, EMOTION_MAP, RANGE_OPTIONS } from '../lib/emotions.js';
import { formatDate } from '../lib/format.js';

export default function Analytics() {
  const [range, setRange] = useState('30');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .analytics(range)
      .then((data) => {
        if (!active) return;
        setStats(data);
        setError('');
      })
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [range]);

  if (error) return <div className="notice notice-error" role="alert">{error}</div>;

  const shares = Object.fromEntries(
    EMOTION_KEYS.map((key) => [
      key,
      stats && stats.total ? ((stats.emotionCounts[key] || 0) / stats.total) * 100 : 0,
    ]),
  );
  const dominant = stats?.dominantEmotion ? EMOTION_MAP[stats.dominantEmotion] : null;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Analytics</span>
          <h1>Patterns over time</h1>
          <p className="muted">Compare how your emotional tone has moved across different windows.</p>
        </div>
        <div className="segmented" role="group" aria-label="Date range">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={range === option.value ? 'active' : ''}
              aria-pressed={range === option.value}
              onClick={() => {
                setStats(null);
                setRange(option.value);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {!stats ? (
        <PageLoader />
      ) : (
        <>
          <section className="stats">
            <StatCard label="Reflections" value={stats.total} hint="In this range" icon={Layers} />
            <StatCard
              label="Dominant mood"
              value={dominant ? dominant.label : '—'}
              hint="Most frequent"
              icon={Sparkles}
              accent={dominant?.color}
            />
            <StatCard
              label="Check-in streak"
              value={`${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`}
              hint="Consecutive days"
              icon={Flame}
            />
            <StatCard
              label="Latest entry"
              value={stats.latest ? EMOTION_MAP[stats.latest.dominantEmotion].label : '—'}
              hint={stats.latest ? formatDate(stats.latest.createdAt) : 'None yet'}
              icon={Activity}
            />
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Daily activity</h2>
              <span className="muted small">{stats.daily.length} days shown</span>
            </div>
            <ActivityChart data={stats.daily} />
          </section>

          <section className="grid-2">
            <div className="card">
              <div className="card-head"><h2>Mood share</h2><span className="muted small">Share of reflections</span></div>
              <EmotionBars values={shares} />
            </div>
            <div className="card">
              <div className="card-head"><h2>Average intensity</h2><span className="muted small">Across all entries</span></div>
              <EmotionBars values={stats.averageScores} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
