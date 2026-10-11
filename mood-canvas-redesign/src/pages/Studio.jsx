import { useEffect, useRef, useState } from 'react';
import { Download, Mic, MicOff, RotateCcw, Star } from 'lucide-react';
import { api } from '../api.js';
import EmotionBars from '../components/EmotionBars.jsx';
import MoodArtwork from '../components/MoodArtwork.jsx';
import MoodPill from '../components/MoodPill.jsx';
import { downloadArtwork } from '../lib/artwork.js';
import { EMOTION_MAP } from '../lib/emotions.js';
import { formatDate } from '../lib/format.js';

const MAX_LENGTH = 5000;
const SpeechRecognitionAPI =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function Studio() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');

  useEffect(() => () => recognitionRef.current?.stop(), []);

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    baseTextRef.current = text ? `${text.trimEnd()} ` : '';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setText((baseTextRef.current + transcript).slice(0, MAX_LENGTH));
    };
    recognition.onerror = () => {
      setError('Voice input stopped. Check microphone permissions and try again.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  async function handleAnalyze(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    setBusy(true);
    setError('');
    try {
      const entry = await api.analyze(value);
      setResult(entry);
      setSaved(entry.inGallery);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    recognitionRef.current?.stop();
    setListening(false);
    setText('');
    setResult(null);
    setSaved(false);
    setError('');
  }

  async function toggleGallery() {
    try {
      const updated = await api.setGallery(result.id, !saved);
      setSaved(updated.inGallery);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Studio</span>
          <h1>Reflect in your own words.</h1>
          <p className="muted">Write freely. Your reflection is analyzed on the server and saved to your history.</p>
        </div>
      </header>

      <div className="studio-grid">
        <form className="card studio-form" onSubmit={handleAnalyze}>
          <label className="field-label" htmlFor="reflection">How are you feeling right now?</label>
          <textarea
            id="reflection"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
            rows={11}
            placeholder="Today I felt a little anxious before the meeting, but the walk afterwards helped me feel calm…"
          />
          <div className="studio-tools">
            <span className="muted small">{text.length} / {MAX_LENGTH}</span>
            <div className="row-gap">
              {SpeechRecognitionAPI && (
                <button
                  type="button"
                  className={`btn btn-ghost btn-sm ${listening ? 'is-live' : ''}`}
                  onClick={toggleListening}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  {listening ? 'Stop' : 'Dictate'}
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset} disabled={!text && !result}>
                <RotateCcw size={16} /> Clear
              </button>
              <button className="btn btn-primary" disabled={busy || !text.trim()}>
                {busy ? 'Analyzing…' : 'Analyze mood'}
              </button>
            </div>
          </div>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
        </form>

        <section className="studio-result">
          {result ? (
            <ResultPanel
              result={result}
              saved={saved}
              onToggleGallery={toggleGallery}
            />
          ) : (
            <div className="card placeholder studio-preview">
              <div className="studio-preview-head">
                <div>
                  <span className="eyebrow">MOOD PREVIEW</span>
                  <p className="muted small">A sample of what your reflection can become</p>
                </div>
                <span className="studio-preview-sample">EXAMPLE</span>
              </div>
              <div className="studio-preview-art">
                <MoodArtwork
                  emotions={{ joy: 12, calm: 48, love: 16, anxiety: 10, sadness: 8, tiredness: 6 }}
                  seed="studio-placeholder"
                />
                <div className="studio-preview-mood">
                  <MoodPill emotion="calm" />
                  <h2>Mostly calm</h2>
                  <p className="muted small">A little room to breathe.</p>
                </div>
              </div>
              <div className="studio-preview-breakdown">
                <div className="studio-preview-section-head">
                  <strong>Emotion breakdown</strong>
                  <span className="muted small">Sample</span>
                </div>
                <EmotionBars values={{ joy: 12, calm: 48, love: 16, sadness: 8, anxiety: 10, anger: 2, tiredness: 4 }} />
              </div>
              <div className="studio-preview-cues">
                <span className="muted small">RECOGNIZED CUES</span>
                <div className="cue-list">
                  {['calm', 'breathe', 'grounded'].map((cue) => <span key={cue} className="cue">{cue}</span>)}
                </div>
              </div>
              <p className="muted small center">Your personal artwork and insights will appear here after analysis.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ResultPanel({ result, saved, onToggleGallery }) {
  const dominant = EMOTION_MAP[result.dominantEmotion];
  return (
    <div className="card result-card">
      <MoodArtwork emotions={result.emotions} seed={result.id} />
      <div className="result-head">
        <MoodPill emotion={result.dominantEmotion} />
        <span className="muted small">{formatDate(result.createdAt)}</span>
      </div>
      <h2>{result.neutral ? 'A neutral reflection' : `Mostly ${dominant.label.toLowerCase()}`}</h2>
      {result.neutral && (
        <p className="muted">
          We did not find clear emotional cues, so this reflection is labeled neutral. Try naming a feeling directly.
        </p>
      )}
      {result.cues.length > 0 && (
        <div className="cue-list" aria-label="Recognized emotion cues">
          {result.cues.map((cue) => (
            <span key={cue} className="cue">{cue}</span>
          ))}
        </div>
      )}
      <EmotionBars values={result.emotions} />
      <div className="row-gap">
        <button className={`btn btn-sm ${saved ? 'btn-primary' : 'btn-ghost'}`} onClick={onToggleGallery}>
          <Star size={16} /> {saved ? 'Saved to gallery' : 'Save to gallery'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => downloadArtwork(result.emotions, result.id)}>
          <Download size={16} /> Download SVG
        </button>
      </div>
    </div>
  );
}
