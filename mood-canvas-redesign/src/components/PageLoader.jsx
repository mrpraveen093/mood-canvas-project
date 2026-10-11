export default function PageLoader({ message = 'Loading your canvas…' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="loader-orb" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
