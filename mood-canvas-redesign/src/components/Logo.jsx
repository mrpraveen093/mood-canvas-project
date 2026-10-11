import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="Mood Canvas home">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="mc-logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--accent)' }} />
            <stop offset="1" style={{ stopColor: 'var(--accent-2)' }} />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#mc-logo-grad)" />
        <circle cx="12" cy="13" r="4" style={{ fill: 'var(--bg)' }} opacity=".85" />
      </svg>
      <span>Mood Canvas</span>
    </Link>
  );
}
