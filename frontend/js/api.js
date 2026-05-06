export const BASE_URL = `${window.location.origin}/juanpa/proy1/api`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data.error || data.detail || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getPlayers({ q = '', page = 1, limit = 10, sort = 'name', order = 'asc' } = {}) {
  const params = new URLSearchParams({ page, limit, sort, order });
  if (q) params.set('q', q);
  return request(`/players?${params}`);
}

export function createPlayer(formData) {
  return request('/players', { method: 'POST', body: formData });
}

export function deletePlayer(id) {
  return request(`/players/${id}`, { method: 'DELETE' });
}

export function addRating(id, score) {
  return request(`/players/${id}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score }),
  });
}

export function getRanking() {
  return request('/ranking');
}

export function addToRanking(player_id, tier, position) {
  return request('/ranking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id, tier, position }),
  });
}

export function updateRanking(ranking_id, data) {
  return request(`/ranking/${ranking_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function removeFromRanking(ranking_id) {
  return request(`/ranking/${ranking_id}`, { method: 'DELETE' });
}

export function clearRanking() {
  return request('/ranking', { method: 'DELETE' });
}
