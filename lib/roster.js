// Fighter roster saved in this browser: the preset fighters plus the ones the player created.
import { PRESETS, MAX_CUSTOM, sanitizeFighter } from './fighters.mjs';

const ROSTER_KEY = 'obf_fighters';
const SELECTED_KEY = 'obf_fighter';

export function loadCustom() {
  try {
    const list = JSON.parse(localStorage.getItem(ROSTER_KEY) || '[]');
    return Array.isArray(list) ? list.slice(0, MAX_CUSTOM).map((f, i) => sanitizeFighter(f, `Fighter ${i + 1}`)) : [];
  } catch {
    return [];
  }
}

export function saveCustom(list) {
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(list.slice(0, MAX_CUSTOM)));
  } catch {}
}

export const fullRoster = (custom) => [...PRESETS, ...custom];

export function getSelectedId() {
  try {
    return localStorage.getItem(SELECTED_KEY) || PRESETS[0].id;
  } catch {
    return PRESETS[0].id;
  }
}

export function setSelectedId(id) {
  try {
    localStorage.setItem(SELECTED_KEY, id);
  } catch {}
}
