import { EMOTIONS } from '../lib/emotions.js';

/** values: { [emotionKey]: percentage } */
export default function EmotionBars({ values = {}, suffix = '%' }) {
  return (
    <ul className="bars">
      {EMOTIONS.map((emotion) => {
        const value = Math.max(0, Number(values[emotion.key]) || 0);
        return (
          <li key={emotion.key}>
            <div className="bar-head">
              <span>
                <i className="dot" style={{ background: emotion.color }} />
                {emotion.label}
              </span>
              <span className="muted">{Math.round(value)}{suffix}</span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.min(100, value)}%`, background: emotion.color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
