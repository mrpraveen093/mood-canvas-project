import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Star } from 'lucide-react';
import { api } from '../api.js';
import MoodArtwork from '../components/MoodArtwork.jsx';
import MoodPill from '../components/MoodPill.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { downloadArtwork } from '../lib/artwork.js';
import { formatDate, truncate } from '../lib/format.js';

export default function Gallery() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .gallery()
      .then((res) => active && setItems(res.items))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  async function removeFromGallery(entry) {
    try {
      await api.setGallery(entry.id, false);
      setItems((current) => current.filter((item) => item.id !== entry.id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div className="notice notice-error" role="alert">{error}</div>;
  if (!items) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Gallery</span>
          <h1>Saved canvases</h1>
          <p className="muted">The mood artworks you chose to keep.</p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <h3>No saved artwork yet.</h3>
          <p>Save a canvas from the studio or your history to keep it here.</p>
          <Link to="/studio" className="btn btn-primary btn-sm">Go to the studio</Link>
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map((entry) => (
            <article key={entry.id} className="card gallery-card">
              <MoodArtwork emotions={entry.emotions} seed={entry.id} />
              <div className="meta">
                <MoodPill emotion={entry.dominantEmotion} />
                <time className="muted small">{formatDate(entry.createdAt)}</time>
              </div>
              <p className="muted small">{truncate(entry.description, 110)}</p>
              <div className="actions">
                <button className="btn btn-ghost btn-sm" onClick={() => downloadArtwork(entry.emotions, entry.id)}>
                  <Download size={15} /> Download
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => removeFromGallery(entry)}>
                  <Star size={15} /> Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
