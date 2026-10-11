import { formatDayKey } from '../lib/format.js';

export default function ActivityChart({ data = [] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="activity" role="img" aria-label="Daily reflection activity">
      <div className="activity-bars">
        {data.map((day) => {
          const percent = (day.count / max) * 100;
          return (
            <div key={day.date} className="activity-col" title={`${formatDayKey(day.date)}: ${day.count}`}>
              <div
                className={`activity-bar ${day.count === 0 ? 'empty' : ''}`}
                style={{ height: day.count ? `max(8%, ${percent}%)` : '6%' }}
              />
            </div>
          );
        })}
      </div>
      <div className="activity-axis">
        <span>{formatDayKey(data[0]?.date)}</span>
        <span>{formatDayKey(data.at(-1)?.date)}</span>
      </div>
    </div>
  );
}
