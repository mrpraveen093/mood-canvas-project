import { ArrowRight, Heart, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import MoodPill from '../components/MoodPill.jsx';
import { EMOTIONS } from '../lib/emotions.js';

const COLOR_TOKENS = [
  { name: 'Ink', value: '#0B0C11', group: 'Foundation' },
  { name: 'Surface', value: '#14151E', group: 'Foundation' },
  { name: 'Violet', value: '#A392FF', group: 'Brand' },
  { name: 'Coral', value: '#F4A77F', group: 'Brand' },
  ...EMOTIONS.map(({ label, color }) => ({ name: label, value: color, group: 'Emotion' })),
];

const SPACING = [4, 8, 16, 24, 32, 48, 64];

function ShowcaseSection({ eyebrow, title, children }) {
  return (
    <section className="ds-section">
      <div className="ds-section-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ColorTokens() {
  return (
    <div className="ds-color-grid">
      {COLOR_TOKENS.map(({ name, value, group }) => (
        <article className="ds-color-token" key={name}>
          <span className="ds-color-swatch" style={{ background: value }} />
          <span className="ds-color-name">{name}</span>
          <span className="muted small">{value}</span>
          <span className="ds-token-group">{group}</span>
        </article>
      ))}
    </div>
  );
}

function ThemePreview({ theme }) {
  return (
    <article className="ds-theme-preview" data-theme={theme}>
      <div className="ds-theme-heading">
        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        <strong>{theme === 'dark' ? 'Dark' : 'Light'} appearance</strong>
      </div>
      <div className="ds-theme-card">
        <span className="eyebrow">A GENTLE CHECK-IN</span>
        <h3>How are you feeling?</h3>
        <p className="muted small">A quiet moment to notice what’s here.</p>
        <div className="row-gap">
          <MoodPill emotion="calm" />
          <MoodPill emotion="joy" />
        </div>
      </div>
      <button className="btn btn-primary btn-sm" type="button">
        Save reflection <ArrowRight size={15} />
      </button>
    </article>
  );
}

export default function DesignSystem() {
  return (
    <div className="ds-page">
      <header className="ds-nav">
        <Logo />
        <Link className="btn btn-ghost btn-sm" to="/">Back to Mood Canvas</Link>
      </header>
      <main className="ds-main">
        <header className="ds-hero">
          <span className="eyebrow">MOOD CANVAS · UI FOUNDATIONS</span>
          <h1>A little system for feeling more in tune.</h1>
          <p className="lead">
            A shared visual language for reflection, emotional insight, and the small moments in between.
          </p>
          <div className="ds-theme-pair">
            <ThemePreview theme="dark" />
            <ThemePreview theme="light" />
          </div>
        </header>

        <ShowcaseSection eyebrow="01 · Color" title="Color with a softer edge">
          <p className="muted">Ink and layered surfaces make space for the seven emotion colors to come forward.</p>
          <ColorTokens />
        </ShowcaseSection>

        <ShowcaseSection eyebrow="02 · Type" title="A clear voice, with room to breathe">
          <div className="ds-type-grid">
            <article className="card ds-type-card">
              <span className="muted small">DISPLAY · FRAUNCES / SERIF</span>
              <h3 className="ds-type-display">Name what you feel.</h3>
              <p className="muted">Expressive headlines and moments of emphasis.</p>
              <span className="ds-type-scale">48 / 36 / 24 / 18 px</span>
            </article>
            <article className="card ds-type-card">
              <span className="muted small">BODY · INTER / SANS-SERIF</span>
              <p className="ds-type-body">
                Let a few honest lines help you notice the shape of your day. Clear, steady text keeps
                reflections and insights easy to read.
              </p>
              <span className="ds-type-scale">16 / 14 / 12 px · line height 1.6</span>
            </article>
          </div>
        </ShowcaseSection>

        <ShowcaseSection eyebrow="03 · Space" title="Built on a steady 8px rhythm">
          <div className="ds-spacing-scale">
            {SPACING.map((value) => (
              <div className="ds-spacing-item" key={value}>
                <span>{value}px</span>
                <i style={{ width: `${value}px`, height: `${value}px` }} />
              </div>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection eyebrow="04 · Components" title="Small building blocks, one consistent feel">
          <div className="ds-component-grid">
            <article className="card ds-component-card">
              <h3>Buttons</h3>
              <div className="row-gap">
                <button className="btn btn-primary" type="button">Primary</button>
                <button className="btn btn-ghost" type="button">Ghost</button>
                <button className="btn btn-icon" type="button" aria-label="Favorite">
                  <Heart size={17} />
                </button>
                <button className="btn btn-danger" type="button">Danger</button>
              </div>
            </article>

            <article className="card ds-component-card">
              <h3>Form fields</h3>
              <label className="field-label" htmlFor="ds-reflection">Reflection title</label>
              <input id="ds-reflection" type="text" placeholder="A small win today…" />
              <p className="muted small">Focus the field to see its glow.</p>
            </article>

            <article className="card ds-component-card">
              <h3>Emotion pills</h3>
              <div className="ds-pill-list">
                {EMOTIONS.map(({ key }) => <MoodPill key={key} emotion={key} />)}
              </div>
            </article>

            <article className="card ds-component-card">
              <h3>Cards & notices</h3>
              <div className="ds-mini-card">
                <span className="muted small">TODAY’S NOTE</span>
                <strong>A little more grounded.</strong>
                <MoodPill emotion="calm" />
              </div>
              <div className="notice notice-success ds-notice">Your reflection is saved.</div>
              <div className="notice notice-error ds-notice">Please check your entry.</div>
            </article>
          </div>
        </ShowcaseSection>
      </main>
      <footer className="footer">Mood Canvas · Thoughtful by design.</footer>
    </div>
  );
}
