/* ═══════════════════════════════════════════════════════════
   THE MONEY FLIP — history.js
   Хранилище трансформаций.
   Чтобы перейти на Supabase — замени только тело этих 4 функций.
   ═══════════════════════════════════════════════════════════ */

const HISTORY_KEY = 'transformation_history';

function getAllTransformations() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function getTransformationById(id) {
  return getAllTransformations().find(e => e.id === id) || null;
}

function saveTransformation(belief, context, intensity, results) {
  const id = Date.now().toString();
  const record = {
    id,
    date: new Date().toISOString(),
    belief,
    context,
    intensity: parseInt(intensity),
    results, // { master, battle, code }
    feedback: { rating: null, comment: '' },
  };
  const all = getAllTransformations();
  all.push(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  return id;
}

function updateFeedback(id, rating, comment) {
  const all = getAllTransformations();
  const idx = all.findIndex(e => e.id === id);
  if (idx === -1) return false;
  all[idx].feedback = { rating, comment };
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  return true;
}
