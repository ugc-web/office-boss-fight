// Renders a blocky character from lib/mobs.js. Every limb is its own element, so CSS
// (the .mob rules in globals.css) can animate arms, legs, necks, wings and tentacles.
// Poses: idle | walk | attack | hurt | ko | cheer | cast
import { MOBS } from '@/lib/mobs';

const shade = (u) => `inset -${u}px -${u}px 0 rgba(0,0,0,.28), inset ${u}px ${u}px 0 rgba(255,255,255,.16)`;

function Part({ p, u }) {
  const solid = p.bg !== 'transparent' && p.w > 2 && p.h > 2;
  return (
    <div
      className={`absolute ${p.cls ? `m-${p.cls}` : ''}`}
      style={{ left: p.x * u, top: p.y * u, width: p.w * u, height: p.h * u, background: p.bg, boxShadow: solid ? shade(u) : undefined, ...p.st }}
    >
      {p.kids.map((k, i) => <Part key={i} p={k} u={u} />)}
    </div>
  );
}

/**
 * `height` = target height in px (snapped to whole pixel units so edges stay crisp).
 * `model` overrides the built-in model (custom fighters); `variant` (fighting style) picks the attack animation.
 */
export default function Mob({ name, model, variant, height = 120, pose = 'idle', className = '', style, title }) {
  const m = model || MOBS[name];
  if (!m) return null;
  const u = Math.max(1, Math.round(height / m.h));
  return (
    <div
      className={`mob mob-${name} relative shrink-0 ${className}`}
      data-pose={pose}
      data-variant={variant}
      style={{ width: m.w * u, height: m.h * u, '--u': `${u}px`, ...style }}
      role="img"
      aria-label={title || name}
    >
      <div className="mob-body absolute inset-0">
        {m.parts.map((p, i) => <Part key={i} p={p} u={u} />)}
      </div>
    </div>
  );
}
