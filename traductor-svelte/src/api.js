const API_BASE = 'http://localhost:4000';

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

export async function listWords({ q = '', lang = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (lang) params.set('lang', lang);
  return jsonFetch(`${API_BASE}/words?${params.toString()}`);
}

export async function createWord(payload) {
  return jsonFetch(`${API_BASE}/words`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateWord(id, payload) {
  return jsonFetch(`${API_BASE}/words/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteWord(id) {
  return jsonFetch(`${API_BASE}/words/${id}`, { method: 'DELETE' });
}

export async function translate({ text, from, to }) {
  const params = new URLSearchParams({ text, from, to });
  return jsonFetch(`${API_BASE}/translate?${params.toString()}`);
}
