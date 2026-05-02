import { BASE_URL } from './api.js';
import { state } from './state.js';

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F'];

const TIER_COLORS = {
  S: 'linear-gradient(135deg, #FFD700, #FFA500)',
  A: 'linear-gradient(135deg, #FF6B6B, #FF4757)',
  B: 'linear-gradient(135deg, #2ED573, #17A85A)',
  C: 'linear-gradient(135deg, #1E90FF, #0056B3)',
  D: 'linear-gradient(135deg, #A29BFE, #6C5CE7)',
  F: 'linear-gradient(135deg, #A4B0BE, #747D8C)',
};

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

function playerImgHtml(imageUrl, name, cssClass) {
  if (!imageUrl) return `<div class="${cssClass}-placeholder"></div>`;
  const src = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
  return `<img src="${src}" alt="${escapeHtml(name)}" class="${cssClass}" loading="lazy">`;
}

export function renderPlayers() {
  const container = document.getElementById('players');

  if (!state.players.length) {
    container.innerHTML = '<p class="empty-msg">No players found. Add one above!</p>';
    return;
  }

  container.innerHTML = state.players.map(p => {
    const entry = state.rankingEntries[p.id];
    const currentTier = entry?.tier ?? '';
    const rating = p.avg_rating != null ? p.avg_rating.toFixed(1) : null;

    return `
      <article class="card player-card" data-id="${p.id}">
        <div class="card-img-wrap">
          ${playerImgHtml(p.image_url, p.name, 'player-img')}
          ${currentTier ? `<span class="tier-badge" data-tier="${currentTier}">${currentTier}</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="player-name">${escapeHtml(p.name)}</h3>
          <div class="player-meta">
            ${p.country ? `<span class="meta-tag"> ${escapeHtml(p.country)}</span>` : ''}
            ${p.club    ? `<span class="meta-tag">${escapeHtml(p.club)}</span>`    : ''}
          </div>
          <div class="player-rating">
            ${rating ? `<span class="stars">${rating}<small>/10</small></span>` : '<span class="no-rating">Not rated yet</span>'}
          </div>

          <div class="action-row">
            <input
              type="number"
              class="rating-input"
              min="1" max="10" step="0.1"
              placeholder="1 – 10"
              data-player-id="${p.id}"
            >
            <button class="btn btn-rate" data-action="rate" data-player-id="${p.id}"> Rate</button>
          </div>

          <div class="action-row">
            <select class="tier-select" data-player-id="${p.id}">
              <option value="">— Tier —</option>
              ${TIERS.map(t =>
                `<option value="${t}" ${currentTier === t ? 'selected' : ''}>${t} Tier</option>`
              ).join('')}
            </select>
            <button class="btn btn-tier" data-action="assign-tier" data-player-id="${p.id}">Assign</button>
          </div>

          <button class="btn btn-delete" data-action="delete" data-player-id="${p.id}"> Delete</button>
        </div>
      </article>`;
  }).join('');
}

export function renderRanking() {
  const container = document.getElementById('ranking');

  if (!state.ranking.length) {
    container.innerHTML = '<p class="empty-msg">No tier list yet. Assign players to tiers! </p>';
    return;
  }

  container.innerHTML = state.ranking.map(({ tier, players }) => `
    <div class="tier" data-tier="${tier}">
      <div class="tier-label" style="background: ${TIER_COLORS[tier] ?? '#ccc'}">${tier}</div>
      <div class="tier-players">
        ${players.map(p => `
          <div class="tier-player-card">
            ${playerImgHtml(p.image_url, p.name, 'tier-player-img')}
            <span class="tier-player-name">${escapeHtml(p.name)}</span>
            ${p.rating != null ? `<span class="tier-player-rating">${p.rating}<small>/10</small></span>` : ''}
          </div>`).join('')}
        ${players.length === 0 ? '<span class="tier-empty">Empty</span>' : ''}
      </div>
    </div>`).join('');
}

export function showLoading(id) {
  document.getElementById(id)?.classList.remove('hidden');
}

export function hideLoading(id) {
  document.getElementById(id)?.classList.add('hidden');
}

let toastTimer;
export function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

export function updatePagination() {
  document.getElementById('page-info').textContent = `Page ${state.page}`;
  document.getElementById('prev-page').disabled = state.page <= 1;
  document.getElementById('next-page').disabled = !state.hasMore;
}
