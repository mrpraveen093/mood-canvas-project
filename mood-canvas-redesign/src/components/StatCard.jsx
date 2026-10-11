export default function StatCard({ label, value, hint, icon: Icon, accent }) {
  return (
    <article className="stat">
      <div className="stat-top">
        <span>{label}</span>
        {Icon && (
          <span className="stat-icon" aria-hidden="true">
            <Icon size={17} strokeWidth={1.8} />
          </span>
        )}
      </div>
      <div className="stat-value" style={{ '--c': accent || 'var(--text)' }}>
        {value}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
    </article>
  );
}
