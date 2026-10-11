import { Link, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Analytics from './pages/Analytics.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DesignSystem from './pages/DesignSystem.jsx';
import Gallery from './pages/Gallery.jsx';
import History from './pages/History.jsx';
import Landing from './pages/Landing.jsx';
import MoodDNA from './pages/MoodDNA.jsx';
import Settings from './pages/Settings.jsx';
import Studio from './pages/Studio.jsx';

function NotFound() {
  return (
    <div className="not-found">
      <span className="eyebrow">404</span>
      <h1>This page is blank canvas.</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/design-system" element={<DesignSystem />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/mood-dna" element={<MoodDNA />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
