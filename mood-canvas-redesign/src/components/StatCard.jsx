
export default function StatCard({ label, value, hint, icon: Icon, accent }) {
  return (
    <article className="stat premium-stat">
      <div className="premium-stat-top">
        <span className="premium-stat-label">{label}</span>

        {Icon && (
          <span
            className="premium-stat-icon"
            style={{ '--stat-accent': accent || 'var(--accent)' }}
            aria-hidden="true"
          >
            <Icon size={20} strokeWidth={1.8} />
          </span>
        )}
      </div>

      <div
        className="stat-value premium-stat-value"
        style={{ '--c': accent || 'var(--text)' }}
      >
        {value}
      </div>

      {hint && (
        <div className="premium-stat-hint">
          {hint}
        </div>
      )}

      <span className="premium-stat-decoration" aria-hidden="true" />
    </article>
  );
}
