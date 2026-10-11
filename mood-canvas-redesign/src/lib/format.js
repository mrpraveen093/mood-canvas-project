export function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Formats a UTC "YYYY-MM-DD" key from the analytics API. */
export function formatDayKey(dayKey) {
  if (!dayKey) return '';
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'there';
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

export function truncate(text, length = 140) {
  if (!text || text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}
