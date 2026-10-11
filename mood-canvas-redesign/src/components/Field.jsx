export default function Field({ label, hint, ...inputProps }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...inputProps} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
