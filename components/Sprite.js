'use client';
// Realistic character sprites (public/sprites), one image per key pose: ready, attack, hurt, victory.
// Poses swap pose-to-pose like classic fighting games; CSS adds breathing, recoil, KO falls and victory bounces.
// lib/spriteData.json holds each image's size, its height in the source render (so poses keep the same scale)
// and where the feet are (so every pose stands on the same spot).
import { useEffect } from 'react';
import SPRITE_DATA from '@/lib/spriteData.json';
import Mob from './Mob';

export const spriteSet = (key) => (key && SPRITE_DATA[key]?.ready ? SPRITE_DATA[key] : null);

// Arena poses -> sprite images
const POSE = { idle: 'ready', walk: 'ready', attack: 'attack', cast: 'attack', hurt: 'hurt', ko: 'hurt', cheer: 'victory' };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Width of a sprite set's ready pose at a given height (used for layout). */
export const spriteWidth = (set, height) => (height * set.ready.w) / set.ready.h;

/** `facing`: which way the character looks (heroes right, bosses left); a KO falls backwards. */
export default function Sprite({ set, pose = 'idle', height, facing = 'right', hover = false, className = '', style, title, glow }) {
  useEffect(() => {
    Object.values(set).forEach((p) => { const i = new Image(); i.src = p.src; });
  }, [set]);
  const key = POSE[pose] || 'ready';
  const p = set[key] || set.ready;
  const h = height * clamp(p.srcH / set.ready.srcH, 0.75, 1.35);
  const w = (h * p.w) / p.h;
  const baseW = spriteWidth(set, height);
  return (
    <div className={`sprite relative shrink-0 ${className}`} data-pose={pose} style={{ width: baseW, height, '--fall': facing === 'right' ? -1 : 1, ...style }} role="img" aria-label={title}>
      <div className="sprite-shadow absolute left-1/2 -translate-x-1/2 rounded-[50%]" style={{ bottom: -height * 0.02, width: baseW * 0.9, height: height * 0.05 }} />
      <div className={`absolute inset-0 ${hover ? 'sprite-hover' : ''}`}>
      <img
        key={key}
        src={p.src}
        alt=""
        draggable={false}
        className="sprite-img absolute bottom-0 max-w-none select-none pointer-events-none"
        style={{ height: h, width: w, left: baseW * set.ready.foot - w * p.foot, filter: glow ? `drop-shadow(0 0 10px ${glow})` : undefined }}
      />
      </div>
    </div>
  );
}

/** The player's fighter: realistic sprite for the 4 main fighters, the voxel model for custom ones. */
export function HeroFigure({ fighter, model, pose, height, title }) {
  const set = fighter.preset ? spriteSet(fighter.id) : null;
  if (set) return <Sprite set={set} pose={pose} height={height} facing="right" title={title} />;
  return <Mob name="hero" model={model} variant={fighter.style} height={height} pose={pose} title={title} />;
}

/** A boss: realistic sprite when there is one, otherwise its voxel model. */
export function BossFigure({ boss, pose, height }) {
  const set = spriteSet(boss.sprite);
  if (set) return <Sprite set={set} pose={pose} height={height} facing="left" hover={boss.sprite === 'drone'} title={boss.name} />;
  return <Mob name={boss.sprite} height={height} pose={pose} title={boss.name} />;
}

/** Art from public/sprites is a transparent full-body cutout: show it whole, standing on the bottom edge. */
export const isCutout = (src) => typeof src === 'string' && src.startsWith('/sprites/');
export const artFit = (src) => (isCutout(src) ? 'object-contain object-bottom' : 'object-cover');
/** The attack pose of a sprite (for ultimate cut-ins), or the art itself. */
export const actionArt = (src) => (isCutout(src) ? src.replace('_ready.', '_attack.') : src);
