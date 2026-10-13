// Browser full-screen mode. iPhones don't support it for web pages; there the game still fills the screen.
const el = () => document.documentElement;

export const canFullscreen = () => typeof document !== 'undefined' && !!(el().requestFullscreen || el().webkitRequestFullscreen);
export const isFullscreen = () => typeof document !== 'undefined' && !!(document.fullscreenElement || document.webkitFullscreenElement);

/** Must be called from a click or key press. */
export function enterFullscreen() {
  if (!canFullscreen() || isFullscreen()) return;
  try {
    const r = (el().requestFullscreen || el().webkitRequestFullscreen).call(el(), { navigationUI: 'hide' });
    r?.catch?.(() => {});
  } catch {}
}

export function exitFullscreen() {
  if (!isFullscreen()) return;
  try {
    const r = (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    r?.catch?.(() => {});
  } catch {}
}

export function onFullscreenChange(fn) {
  document.addEventListener('fullscreenchange', fn);
  document.addEventListener('webkitfullscreenchange', fn);
  return () => {
    document.removeEventListener('fullscreenchange', fn);
    document.removeEventListener('webkitfullscreenchange', fn);
  };
}
