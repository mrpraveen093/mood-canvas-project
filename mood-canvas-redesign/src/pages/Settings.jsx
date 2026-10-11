import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { api } from '../api.js';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function Notice({ message }) {
  if (!message) return null;
  const className = message.type === 'error' ? 'notice-error' : 'notice-success';
  return <div className={`notice ${className}`} role="status">{message.text}</div>;
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: user.name, email: user.email });
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteMsg, setDeleteMsg] = useState(null);

  async function saveProfile(event) {
    event.preventDefault();
    setProfileMsg(null);
    try {
      const res = await api.updateProfile(profile);
      updateUser(res.user);
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordMsg(null);
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      await api.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    }
  }

  async function deleteAccount(event) {
    event.preventDefault();
    if (!window.confirm('Delete your account and every reflection? This cannot be undone.')) return;
    setDeleteMsg(null);
    try {
      await api.deleteAccount(deletePassword);
      logout();
      navigate('/');
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err.message });
    }
  }

  const themeOptions = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Settings</span>
          <h1>Your account</h1>
          <p className="muted">Manage your profile, security, and appearance.</p>
        </div>
      </header>

      <div className="settings-grid">
        <form className="card" onSubmit={saveProfile}>
          <h2>Profile</h2>
          <Field
            label="Name"
            value={profile.name}
            maxLength={80}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
          />
          <Field
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            required
          />
          <Notice message={profileMsg} />
          <button className="btn btn-primary btn-sm">Save profile</button>
        </form>

        <div className="card">
          <h2>Appearance</h2>
          <p className="muted small">Your choice is remembered in this browser.</p>
          <div className="theme-options">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className="theme-option"
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                <Icon size={18} />
                <strong style={{ display: 'block', marginTop: '.5rem' }}>{label}</strong>
              </button>
            ))}
          </div>
        </div>

        <form className="card" onSubmit={changePassword}>
          <h2>Change password</h2>
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            required
          />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
            minLength={8}
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            required
          />
          <Field
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            required
          />
          <Notice message={passwordMsg} />
          <button className="btn btn-primary btn-sm">Update password</button>
        </form>

        <form className="card danger-zone" onSubmit={deleteAccount}>
          <h2>Delete account</h2>
          <p className="muted small">
            This permanently removes your account and every reflection, including saved artwork.
          </p>
          <Field
            label="Confirm with your password"
            type="password"
            autoComplete="current-password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            required
          />
          <Notice message={deleteMsg} />
          <button className="btn btn-ghost btn-sm danger">Delete my account</button>
        </form>
      </div>
    </div>
  );
}
