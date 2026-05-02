export const state = {
  players: [],
  ranking: [],
  rankingEntries: {}, // player_id → { ranking_id, tier, position }
  page: 1,
  limit: 10,
  query: '',
  hasMore: true,
};

export function loadRankingEntriesFromStorage() {
  try {
    const stored = localStorage.getItem('goat_ranking_entries');
    if (stored) state.rankingEntries = JSON.parse(stored);
  } catch (_) {
    state.rankingEntries = {};
  }
}

export function saveRankingEntriesToStorage() {
  localStorage.setItem('goat_ranking_entries', JSON.stringify(state.rankingEntries));
}

export function syncRankingEntriesWithApi(rankingData) {
  const rankedIds = new Set(rankingData.flatMap(t => t.players.map(p => p.id)));
  for (const pid of Object.keys(state.rankingEntries)) {
    if (!rankedIds.has(parseInt(pid, 10))) {
      delete state.rankingEntries[pid];
    }
  }
  saveRankingEntriesToStorage();
}
