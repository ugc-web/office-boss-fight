// Lightweight, provider-agnostic analytics.
// Events go to: window.va (Vercel Analytics, if installed), window.gtag / window.plausible (if present),
// and a local log in localStorage so metrics can be inspected without a backend.
//
// Events: game_start, game_complete, game_over, answer, share_click, challenge_click,
//         challenge_link_open, replay

const LOG_KEY = 'obf_events';

export function track(name, props = {}) {
  if (typeof window === 'undefined') return;
  const event = { name, props, t: Date.now() };
  try {
    window.va?.('event', { name, data: props });
    window.gtag?.('event', name, props);
    window.plausible?.(name, { props });
    const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    log.push(event);
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-500)));
  } catch {
    /* analytics must never break the game */
  }
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', name, props);
}

export function getBest() {
  try {
    return JSON.parse(localStorage.getItem('obf_best') || 'null');
  } catch {
    return null;
  }
}

export function saveBest(result) {
  try {
    const best = getBest();
    if (!best || result.score > best.score || (result.score === best.score && result.hp > best.hp)) {
      localStorage.setItem('obf_best', JSON.stringify(result));
      return true;
    }
  } catch {}
  return false;
}
