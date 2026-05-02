import { state, loadRankingEntriesFromStorage, saveRankingEntriesToStorage, syncRankingEntriesWithApi } from './state.js';
import * as api from './api.js';
import {
  renderPlayers,
  renderRanking,
  showLoading,
  hideLoading,
  showToast,
  updatePagination,
} from './ui.js';

// ── Data loaders ───────────────────────────────────────────────────────────────

async function loadPlayers() {
  showLoading('loading-players');
  try {
    const players = await api.getPlayers({ q: state.query, page: state.page, limit: state.limit });
    state.players = players;
    state.hasMore = players.length === state.limit;
    renderPlayers();
    updatePagination();
  } catch (err) {
    showToast(`Could not load players: ${err.message}`, 'error');
  } finally {
    hideLoading('loading-players');
  }
}

async function loadRanking() {
  showLoading('loading-ranking');
  try {
    const data = await api.getRanking();
    state.ranking = data;
    syncRankingEntriesWithApi(data);
    renderRanking();
  } catch (err) {
    showToast(`Could not load ranking: ${err.message}`, 'error');
  } finally {
    hideLoading('loading-ranking');
  }
}

// ── Handlers ───────────────────────────────────────────────────────────────────

async function handleCreatePlayer(e) {
  e.preventDefault();
  const btnText = document.getElementById('form-btn-text');
  const errEl   = document.getElementById('form-error');

  btnText.textContent = ' Adding...';
  errEl.classList.add('hidden');

  const formData = new FormData();
  const name    = document.getElementById('name').value.trim();
  const country = document.getElementById('country').value.trim();
  const club    = document.getElementById('club').value.trim();
  const file    = document.getElementById('image').files[0];

  formData.append('name', name);
  if (country) formData.append('country', country);
  if (club)    formData.append('club', club);
  if (file)    formData.append('image', file);

  try {
    await api.createPlayer(formData);
    e.target.reset();
    showToast('Player added! ');
    state.page = 1;
    await loadPlayers();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btnText.textContent = 'Add Player';
  }
}

async function handleDeletePlayer(playerId) {
  if (!confirm('Delete this player permanently?')) return;
  try {
    await api.deletePlayer(playerId);
    delete state.rankingEntries[playerId];
    saveRankingEntriesToStorage();
    showToast('Player deleted ');
    await Promise.all([loadPlayers(), loadRanking()]);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function handleRate(playerId) {
  const input = document.querySelector(`.rating-input[data-player-id="${playerId}"]`);
  const score = parseFloat(input?.value);

  if (!score || score < 1 || score > 10) {
    showToast('Enter a score between 1 and 10', 'error');
    return;
  }

  try {
    await api.addRating(playerId, score);
    if (input) input.value = '';
    showToast('Rating submitted! ');
    await Promise.all([loadPlayers(), loadRanking()]);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function handleAssignTier(playerId) {
  const select = document.querySelector(`.tier-select[data-player-id="${playerId}"]`);
  const tier   = select?.value;

  if (!tier) {
    showToast('Select a tier first', 'error');
    return;
  }

  const existing = state.rankingEntries[playerId];

  try {
    if (existing) {
      if (existing.tier === tier) {
        showToast(`Already in ${tier} Tier`, 'info');
        return;
      }
      await api.updateRanking(existing.ranking_id, { tier });
      state.rankingEntries[playerId].tier = tier;
    } else {
      const tierData = state.ranking.find(t => t.tier === tier);
      const position = (tierData?.players.length ?? 0) + 1;

      try {
        const result = await api.addToRanking(playerId, tier, position);
        state.rankingEntries[playerId] = { ranking_id: result.id, tier, position };
      } catch (postErr) {
        // Player was already ranked (added outside this session) — can't update without id
        showToast('Player already ranked. Reload the page to sync.', 'error');
        return;
      }
    }

    saveRankingEntriesToStorage();
    showToast(`Moved to ${tier} Tier! `);
    await loadRanking();
    renderPlayers();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ── Event delegation ───────────────────────────────────────────────────────────

function onPlayersClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const playerId = parseInt(btn.dataset.playerId, 10);
  switch (btn.dataset.action) {
    case 'delete':      handleDeletePlayer(playerId); break;
    case 'rate':        handleRate(playerId);         break;
    case 'assign-tier': handleAssignTier(playerId);   break;
  }
}

// ── Search (debounced) ─────────────────────────────────────────────────────────

let searchTimer;
function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    state.query = document.getElementById('search').value.trim();
    state.page  = 1;
    await loadPlayers();
  }, 400);
}

// ── Pagination ─────────────────────────────────────────────────────────────────

async function onPrev() {
  if (state.page > 1) { state.page--; await loadPlayers(); }
}

async function onNext() {
  if (state.hasMore) { state.page++; await loadPlayers(); }
}

// ── Init ───────────────────────────────────────────────────────────────────────

async function init() {
  loadRankingEntriesFromStorage();

  document.getElementById('player-form').addEventListener('submit', handleCreatePlayer);
  document.getElementById('search').addEventListener('input', onSearch);
  document.getElementById('players').addEventListener('click', onPlayersClick);
  document.getElementById('prev-page').addEventListener('click', onPrev);
  document.getElementById('next-page').addEventListener('click', onNext);

  await Promise.all([loadPlayers(), loadRanking()]);
}

init();
