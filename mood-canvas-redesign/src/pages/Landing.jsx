import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Dna, Heart, Layers, PenLine, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import MoodArtwork from '../components/MoodArtwork.jsx';

const PREVIEW_ACTIVITY = [22, 38, 30, 48, 34, 62, 42, 74, 50, 66, 40, 82, 55, 70, 46, 92, 60, 76, 50, 68, 40, 84, 56, 72, 48, 96, 62, 78, 52, 88];

const FEATURES = [
  {
    icon: PenLine,
    title: 'Reflect in your own words',
    text: 'Write or dictate how your day felt. Each reflection is read by a transparent, keyword-based emotion analyzer.',
  },
  {
    icon: Sparkles,
    title: 'Paint your mood',
    text: 'Every reflection becomes a unique piece of mood artwork you can save to your gallery or download.',
  },
  {
    icon: Dna,
    title: 'Discover your Mood DNA',
    text: 'See your average emotional profile across seven dimensions and how it shifts over time.',
  },
  {
    icon: Activity,
    title: 'Track the patterns',
    text: 'Explore daily activity, check-in streaks, and emotion trends across any time range.',
  },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-badge"><span /> A softer way to check in with yourself</span>
            <h1>
              Turn your feelings into a <span className="gradient-text">living portrait.</span>
            </h1>
            <p className="lead">
              A few honest lines can reveal a lot. Reflect, discover the emotional patterns in your words,
              and watch each moment become a piece of art.
            </p>
            <div className="cta-row">
              <Link to="/signup" className="btn btn-primary">
                Start your canvas <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-ghost">I already have an account</Link>
            </div>
            <div className="hero-assurance">
              <ShieldCheck size={16} />
              <span>Your reflections are private to your account.</span>
            </div>
          </div>
          <div className="hero-visual">
            <span className="hero-orbit hero-orbit-one" aria-hidden="true" />
            <span className="hero-orbit hero-orbit-two" aria-hidden="true" />
            <div className="hero-preview" aria-label="Illustrative Mood Canvas dashboard preview">
              <div className="preview-window">
                <div className="preview-topbar">
                  <div className="preview-brand"><Logo /><span>YOUR SPACE</span></div>
                  <span className="preview-period">LAST 30 DAYS</span>
                </div>
                <div className="preview-content">
                  <div className="preview-heading">
                    <div>
                      <span className="preview-kicker">YOUR DASHBOARD</span>
                      <h2>A little more in tune.</h2>
                    </div>
                    <span className="preview-avatar" aria-hidden="true">A</span>
                  </div>
                  <div className="preview-stats">
                    <div className="preview-stat">
                      <span><Layers size={14} /> REFLECTIONS</span>
                      <strong>18</strong>
                      <small>This month</small>
                    </div>
                    <div className="preview-stat preview-mood">
                      <span><Sparkles size={14} /> YOUR MOOD</span>
                      <strong>Mostly calm</strong>
                      <small>A moment to breathe</small>
                    </div>
                  </div>
                  <div className="preview-lower">
                    <div className="preview-chart">
                      <div className="preview-chart-head">
                        <span>Daily activity</span>
                        <small><Activity size={12} /> 30 days</small>
                      </div>
                      <div className="preview-bars" aria-hidden="true">
                        {PREVIEW_ACTIVITY.map((height, index) => (
                          <i key={index} style={{ '--bar-height': `${height}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="preview-art">
                      <span>YOUR MOOD ART</span>
                      <MoodArtwork
                        emotions={{ joy: 22, calm: 38, love: 18, anxiety: 9, sadness: 8, tiredness: 5 }}
                        seed="landing-hero"
                      />
                      <span className="preview-art-caption">A portrait of your month</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hero-float-card" aria-label="Example mood insight">
                <span className="hero-float-icon"><Heart size={17} fill="currentColor" /></span>
                <span><small>A MOMENT TO NOTICE</small><strong>Mostly calm</strong></span>
                <span className="hero-float-sparkle"><Sparkles size={16} /></span>
              </div>
            </div>
            <span className="preview-note">A little space to understand how you feel.</span>
          </div>
        </section>

        <div className="promise-strip" aria-label="Mood Canvas principles">
          <span>Private to your account</span>
          <i aria-hidden="true" />
          <span>Transparent emotion analysis</span>
          <i aria-hidden="true" />
          <span>Art made from your reflections</span>
        </div>

        <section className="section">
        <div className="section-head">
          <span className="eyebrow">What you get</span>
          <h2>A calmer way to understand your days.</h2>
        </div>
        <div className="features">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature">
              <div className="feature-icon">
                <Icon size={22} strokeWidth={1.7} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        </section>

        <section className="testimonial-strip" aria-label="A note from the Mood Canvas practice">
          <span className="eyebrow">A NOTE TO CARRY WITH YOU</span>
          <blockquote>“You don’t have to have it all figured out. Sometimes noticing is enough.”</blockquote>
          <span className="testimonial-signoff">A little room to reflect, from Mood Canvas</span>
        </section>

        <section className="cta-band">
        <h2>Your next reflection takes less than a minute.</h2>
        <p className="muted">Create a free account and start painting how you feel.</p>
        <Link to="/signup" className="btn btn-primary">Create your canvas</Link>
        </section>
      </main>

      <footer className="footer">
        <span>Mood Canvas · Your reflections stay in your account.</span>
        <Link to="/design-system" className="link">Explore the design system</Link>
      </footer>
    </div>
  );
}
