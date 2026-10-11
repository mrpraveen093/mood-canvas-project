import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Layers, NotebookPen, Sparkles } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ActivityChart from '../components/ActivityChart.jsx';
import EmotionBars from '../components/EmotionBars.jsx';
import MoodPill from '../components/MoodPill.jsx';
import PageLoader from '../components/PageLoader.jsx';
import StatCard from '../components/StatCard.jsx';
import { EMOTION_MAP } from '../lib/emotions.js';
import { firstName, formatDate, truncate } from '../lib/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.analytics(30), api.moods({ limit: 4 })])
      .then(([analytics, history]) => {
        if (!active) return;
        setStats(analytics);
        setRecent(history.items);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) return <div className="notice notice-error" role="alert">{error}</div>;
  if (!stats) return <PageLoader />;

  const dominant = stats.dominantEmotion ? EMOTION_MAP[stats.dominantEmotion] : null;
  const latest = stats.latest ? EMOTION_MAP[stats.latest.dominantEmotion] : null;

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Good to see you, {firstName(user.name)}.</h1>
          <p className="muted">Here is how your last 30 days have felt.</p>
        </div>
        <Link to="/studio" className="btn btn-primary">
          <NotebookPen size={18} /> New reflection
        </Link>
      </header>

      <section className="stats dashboard-stats" aria-label="Last 30 days at a glance">
        <StatCard label="Reflections" value={stats.total} hint="Last 30 days" icon={Layers} />
        <StatCard
          label="Dominant mood"
          value={dominant ? dominant.label : '—'}
          hint="Most frequent this month"
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
          label="Latest mood"
          value={latest ? latest.label : '—'}
          hint={stats.latest ? formatDate(stats.latest.createdAt) : 'No reflections yet'}
          accent={latest?.color}
        />
      </section>

      <section className="grid-2 dashboard-panels">
        <div className="card">
          <div className="card-head"><h2>Daily activity</h2><span className="muted small">30 days</span></div>
          <ActivityChart data={stats.daily} />
        </div>
        <div className="card">
          <div className="card-head"><h2>Average emotional profile</h2></div>
          <EmotionBars values={stats.averageScores} />
        </div>
      </section>

      <section className="card dashboard-recent">
        <div className="card-head">
          <h2>Recent reflections</h2>
          <Link to="/history" className="link">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty">
            <h3>Your canvas is blank.</h3>
            <p>Write your first reflection to see it appear here.</p>
            <Link to="/studio" className="btn btn-primary btn-sm">Open the studio</Link>
          </div>
        ) : (
          <ul className="entry-list">
            {recent.map((entry) => (
              <li key={entry.id} className="entry-row">
                <div>
                  <div className="row-gap">
                    <MoodPill emotion={entry.dominantEmotion} />
                    <time className="muted small">{formatDate(entry.createdAt)}</time>
                  </div>
                  <p>{truncate(entry.description, 120)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
