import { useEffect, useState } from 'react';
import { Search, Star, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import MoodPill from '../components/MoodPill.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { FILTER_EMOTIONS, RANGE_OPTIONS } from '../lib/emotions.js';
import { formatDate } from '../lib/format.js';

const PAGE_SIZE = 10;

export default function History() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [emotion, setEmotion] = useState('');
  const [days, setDays] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    const params = { page, limit: PAGE_SIZE, days, sort };
    if (emotion) params.emotion = emotion;
    if (query) params.search = query;

    api
      .moods(params)
      .then((res) => {
        if (!active) return;
        setData(res);
        setError('');
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [page, days, sort, emotion, query, reloadKey]);

  const changeFilter = (setter) => (event) => {
    setLoading(true);
    setter(event.target.value);
    setPage(1);
  };

  async function toggleGallery(entry) {
    try {
      const updated = await api.setGallery(entry.id, !entry.inGallery);
      setData((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === updated.id ? updated : item)),
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeEntry(entry) {
    if (!window.confirm('Delete this reflection? This cannot be undone.')) return;
    try {
      await api.deleteMood(entry.id);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">History</span>
          <h1>Your reflections</h1>
          <p className="muted">{data.total} total · search, filter, and revisit anything you have written.</p>
        </div>
      </header>

      <div className="toolbar">
        <label className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search your words…"
            value={search}
            onChange={(e) => {
              setLoading(true);
              setSearch(e.target.value);
            }}
            aria-label="Search reflections"
          />
        </label>
        <select value={emotion} onChange={changeFilter(setEmotion)} aria-label="Filter by mood">
          <option value="">All moods</option>
          {FILTER_EMOTIONS.map((e) => (
            <option key={e.key} value={e.key}>{e.label}</option>
          ))}
        </select>
        <select value={days} onChange={changeFilter(setDays)} aria-label="Filter by date range">
          {RANGE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select value={sort} onChange={changeFilter(setSort)} aria-label="Sort order">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {error && <div className="notice notice-error" role="alert">{error}</div>}

      {loading && data.items.length === 0 ? (
        <PageLoader message="Loading reflections…" />
      ) : data.items.length === 0 ? (
        <div className="empty">
          <h3>No reflections match.</h3>
          <p>Try a different search or filter, or write something new in the studio.</p>
        </div>
      ) : (
        <div className="entry-stack">
          {data.items.map((entry) => (
            <article key={entry.id} className="card entry-card">
              <header>
                <MoodPill emotion={entry.dominantEmotion} />
                <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
              </header>
              <p className="entry-text">{entry.description}</p>
              {entry.cues.length > 0 && (
                <div className="cue-list">
                  {entry.cues.map((cue) => <span key={cue} className="cue">{cue}</span>)}
                </div>
              )}
              <footer>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleGallery(entry)}>
                  <Star size={15} /> {entry.inGallery ? 'In gallery' : 'Add to gallery'}
                </button>
                <button className="btn btn-ghost btn-sm danger" onClick={() => removeEntry(entry)}>
                  <Trash2 size={15} /> Delete
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}

      {data.pages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page} of {data.pages}</span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
