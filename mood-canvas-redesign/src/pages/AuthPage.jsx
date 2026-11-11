import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Field from '../components/Field.jsx';
import Logo from '../components/Logo.jsx';
import MoodArtwork from '../components/MoodArtwork.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { user, login, signup } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/dashboard'} replace />;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isSignup) {
        await signup({ name: form.name, email: form.email, password: form.password });
      } else {
        await login({ email: form.email, password: form.password });
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-visual">
        <Logo />
        <MoodArtwork emotions={{ calm: 34, love: 26, joy: 22, sadness: 12, anxiety: 6 }} seed="auth-visual" />
        <p className="auth-quote">
          “Naming a feeling is the first step to understanding it.”
        </p>
      </aside>

      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <span className="eyebrow">{isSignup ? 'Create account' : 'Welcome back'}</span>
          <h1>{isSignup ? 'Start your canvas.' : 'Sign in to continue.'}</h1>
          <p className="muted">
            {isSignup ? 'Your reflections are private to your account.' : 'Pick up where you left off.'}
          </p>

          {error && <div className="notice notice-error" role="alert">{error}</div>}

          {isSignup && (
            <Field
              label="Name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
              maxLength={80}
              required
            />
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            required
          />
          <label className="field auth-password-field">
            <span>Password</span>
            <div className="auth-password-control">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={update('password')}
                minLength={isSignup ? 8 : undefined}
                required
              />
              <button
                className="auth-password-toggle"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isSignup && <small>At least 8 characters</small>}
          </label>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>

          <p className="muted center small">
            {isSignup ? (
              <>Already have an account? <Link to="/login" className="link">Sign in</Link></>
            ) : (
              <>New here? <Link to="/signup" className="link">Create an account</Link></>
            )}
          </p>
        </form>
      </section>
    </div>
  );
}
