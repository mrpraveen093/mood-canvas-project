const TOKEN_KEY = 'mood-canvas-token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the API is running.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/me', { method: 'PATCH', body: payload }),
  changePassword: (payload) => request('/auth/me/password', { method: 'PATCH', body: payload }),
  deleteAccount: (password) => request('/auth/me', { method: 'DELETE', body: { password } }),

  analyze: (description) => request('/emotions/analyze', { method: 'POST', body: { description } }),
  moods: (params = {}) => request(`/moods?${new URLSearchParams(params)}`),
  analytics: (days) => request(`/moods/analytics?days=${encodeURIComponent(days)}`),
  gallery: () => request('/moods/gallery'),
  setGallery: (id, inGallery) =>
    request(`/moods/${id}/gallery`, { method: 'PATCH', body: { inGallery } }),
  deleteMood: (id) => request(`/moods/${id}`, { method: 'DELETE' }),
};
