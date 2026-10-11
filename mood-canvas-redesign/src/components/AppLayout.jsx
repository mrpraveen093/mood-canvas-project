import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  Dna,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Moon,
  PenLine,
  Settings,
  Sun,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { initials } from '../lib/format.js';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/studio', label: 'Studio', icon: PenLine },
  { to: '/mood-dna', label: 'Mood DNA', icon: Dna },
  { to: '/history', label: 'History', icon: History },
  { to: '/analytics', label: 'Analytics', icon: Activity },
  { to: '/gallery', label: 'Gallery', icon: ImageIcon },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo to="/dashboard" />
        <nav className="nav" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <div className="sidebar-actions">
            <button className="btn btn-icon" onClick={toggleTheme} aria-label="Switch theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn btn-icon" onClick={handleLogout} aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
