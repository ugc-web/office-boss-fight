'use client';
import { useEffect, useMemo, useState } from 'react';
import Mob from './Mob';
import { heroModel } from '@/lib/mobs';
import { STYLES, STAT_LABELS, PRESETS, SKINS, HAIR_COLORS, HAIR_STYLES, OUTFITS, PANTS, ACCENTS, EXTRAS, CUTS, BEARDS, HATS, NAME_MAX, MAX_CUSTOM, randomLook, sanitizeFighter } from '@/lib/fighters.mjs';
import { loadCustom, saveCustom, fullRoster, getSelectedId, setSelectedId } from '@/lib/roster';
import { play, announce } from '@/lib/sound';
import { track } from '@/lib/analytics';
import { artFit } from './Sprite';

const KIND_ICON = { shot: '➶', dash: '»', uppercut: '⤴', slam: '⤓', rain: '☄', beam: '═', summon: '⇡', spin: '⟳', teleport: '✧' };
const LABELS = { short: 'Short', long: 'Long', bun: 'Top-knot', spiky: 'Spiky', cap: 'Cap', bald: 'Bald', none: 'None', headset: 'Headset', glasses: 'Glasses', headband: 'Headband', office: 'Office shirt', samurai: 'Samurai coat', monk: 'Monk robe', wizard: 'Wizard robe' };

/** Speed / Power / Range / Difficulty, 5 blocks each, in the style's colour. */
function Stats({ style }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {Object.entries(style.stats).map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <span className="font-title text-[10px] sm:text-xs text-white/80 w-20 uppercase">{STAT_LABELS[k]}</span>
          <span className="flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((i) => <i key={i} className="block w-3 h-2.5 sm:w-4 sm:h-3 border border-black" style={{ background: i <= v ? style.color : '#1f1b2e', boxShadow: i <= v ? `0 0 6px ${style.color}` : undefined }} />)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Fighter({ f, height, pose = 'idle' }) {
  const model = useMemo(() => heroModel(f), [f]);
  return <Mob name="hero" model={model} variant={f.style} height={height} pose={pose} title={f.name} />;
}

function Swatches({ label, list, value, onChange }) {
  return (
    <div>
      <p className="font-pixel text-sm text-mcgray mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {list.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`${label} ${c}`}
            aria-pressed={value === c}
            className={`w-8 h-8 border-[3px] ${value === c ? 'border-mcyellow scale-110' : 'border-black'} transition-transform`}
            style={{ background: c, boxShadow: 'inset -3px -3px 0 rgba(0,0,0,.3), inset 3px 3px 0 rgba(255,255,255,.25)' }}
          />
        ))}
      </div>
    </div>
  );
}

function Choices({ label, list, value, onChange }) {
  return (
    <div>
      <p className="font-pixel text-sm text-mcgray mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {list.map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)} aria-pressed={value === v} className={`mc-btn !text-sm !px-2.5 !py-1 ${value === v ? '!bg-[#7e88c4] !text-[#ffffa0]' : ''}`}>
            {LABELS[v] || v}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Character creator: name, fighting style and look, with a live preview. */
function Creator({ initial, onSave, onCancel }) {
  const [d, setD] = useState(initial);
  const [pose, setPose] = useState('walk');
  const set = (k) => (v) => setD((x) => ({ ...x, [k]: v }));
  useEffect(() => {
    const id = setTimeout(() => setPose('idle'), 900);
    return () => clearTimeout(id);
  }, []);
  const showOff = () => {
    setPose('attack');
    setTimeout(() => setPose('idle'), 800);
  };
  const setStyle = (s) => {
    setD((x) => ({ ...x, style: s }));
    play('select');
    showOff();
  };
  const randomize = () => {
    setD((x) => ({ ...x, ...randomLook() }));
    play('magic');
    showOff();
  };
  const submit = (e) => {
    e.preventDefault();
    onSave(sanitizeFighter(d, 'Fighter'));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#0d0b14] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="creator-title">
      <form onSubmit={submit} className="max-w-5xl mx-auto p-3 sm:p-6 min-h-full flex flex-col justify-center">
        <h2 id="creator-title" className="font-title text-2xl sm:text-4xl text-mcyellow uppercase text-center mc-text-dark mb-3">{initial.id ? 'Edit fighter' : 'Create fighter'}</h2>
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
          <div className="mc-dark p-4 flex flex-col items-center justify-end min-h-[16rem] relative overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 90%, ${d.accent}55, rgba(16,0,16,.9) 65%)` }}>
            <div className="absolute bottom-6 w-40 h-5 rounded-[50%] bg-black/50" />
            <div className="relative" onClick={showOff}><Fighter f={d} height={200} pose={pose} /></div>
            <p className="relative font-title text-xl sm:text-2xl text-white uppercase mt-3 mc-text-dark text-center break-all">{d.name || 'Fighter'}</p>
            <p className="relative font-pixel text-base text-white/80">{STYLES[d.style].icon} {STYLES[d.style].label}</p>
          </div>

          <div className="mc-dark p-3 sm:p-4 space-y-3">
            <label className="block">
              <span className="font-pixel text-sm text-mcgray">Name</span>
              <input
                value={d.name}
                onChange={(e) => set('name')(e.target.value.slice(0, NAME_MAX))}
                maxLength={NAME_MAX}
                placeholder="Your fighter's name"
                autoFocus
                className="mt-1 w-full font-pixel text-lg px-3 py-2 bg-black/60 text-white border-[3px] border-black outline-none focus:border-mcyellow"
              />
            </label>
            <div>
              <p className="font-pixel text-sm text-mcgray mb-1">Fighting style</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STYLES).map(([k, s]) => (
                  <button key={k} type="button" onClick={() => setStyle(k)} aria-pressed={d.style === k} className={`text-left p-2 border-[3px] ${d.style === k ? 'border-mcyellow bg-[#3b3360]' : 'border-black bg-black/40'} transition-colors`}>
                    <span className="font-pixel text-base text-white">{s.icon} {s.label}</span>
                    <span className="block font-pixel text-xs text-mcgray leading-tight mt-0.5">{s.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Swatches label="Skin" list={SKINS} value={d.skin} onChange={set('skin')} />
              <Swatches label="Hair colour" list={HAIR_COLORS} value={d.hair} onChange={set('hair')} />
              <Swatches label="Outfit" list={OUTFITS} value={d.outfit} onChange={set('outfit')} />
              <Swatches label="Trousers" list={PANTS} value={d.pants} onChange={set('pants')} />
            </div>
            <Swatches label="Accent (tie, gloves, glow)" list={ACCENTS} value={d.accent} onChange={set('accent')} />
            <Choices label="Outfit" list={CUTS} value={d.cut} onChange={set('cut')} />
            <Choices label="Hair" list={HAIR_STYLES} value={d.hairStyle} onChange={set('hairStyle')} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Choices label="Beard" list={BEARDS} value={d.beard} onChange={set('beard')} />
              <Choices label="Hat" list={HATS} value={d.hat} onChange={set('hat')} />
            </div>
            <Choices label="Extra" list={EXTRAS} value={d.extra} onChange={set('extra')} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <button type="button" className="mc-btn" onClick={onCancel}>✖ Cancel</button>
          <button type="button" className="mc-btn" onClick={randomize}>🎲 Random look</button>
          <button type="submit" className="mc-btn mc-btn-green px-8">✔ Save fighter</button>
        </div>
      </form>
    </div>
  );
}

/** Tekken-style character select: big preview on the left, the roster on the right. */
export default function FighterSelect({ current, onPick, onBack }) {
  const [custom, setCustom] = useState([]);
  const [selId, setSelId] = useState(current?.id || PRESETS[0].id);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [locked, setLocked] = useState(null);

  useEffect(() => {
    const c = loadCustom();
    setCustom(c);
    const saved = getSelectedId();
    if ([...PRESETS, ...c].some((f) => f.id === saved)) setSelId(saved);
  }, []);

  const roster = fullRoster(custom);
  const sel = roster.find((f) => f.id === selId) || roster[0];
  const style = STYLES[sel.style];
  const canCreate = custom.length < MAX_CUSTOM;

  const choose = (id) => {
    if (id === selId || locked) return;
    setSelId(id);
    setConfirmDelete(false);
    play('click');
  };

  const pick = () => {
    if (locked) return;
    setSelectedId(sel.id);
    setLocked(sel);
    play('fight');
    announce(sel.name, { pitch: 0.55 });
    track('fighter_select', { style: sel.style, custom: !sel.preset });
    setTimeout(() => onPick(sel), 1300);
  };

  const save = (f) => {
    const exists = custom.some((c) => c.id === f.id);
    const list = exists ? custom.map((c) => (c.id === f.id ? f : c)) : [...custom, f].slice(0, MAX_CUSTOM);
    setCustom(list);
    saveCustom(list);
    setSelId(f.id);
    setEditing(null);
    play('levelup');
    track(exists ? 'fighter_edit' : 'fighter_create', { style: f.style });
  };

  const remove = () => {
    if (!confirmDelete) return setConfirmDelete(true);
    const list = custom.filter((c) => c.id !== sel.id);
    setCustom(list);
    saveCustom(list);
    setSelId(PRESETS[0].id);
    setConfirmDelete(false);
    play('hurt');
  };

  const create = () => {
    if (!canCreate) return;
    play('select');
    setEditing({ id: '', name: `Fighter ${custom.length + 1}`, ...randomLook() });
  };

  // Arrow keys move through the roster, Enter picks.
  useEffect(() => {
    if (editing) return;
    const onKey = (e) => {
      const i = roster.findIndex((f) => f.id === sel.id);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); choose(roster[(i + 1) % roster.length].id); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); choose(roster[(i - 1 + roster.length) % roster.length].id); }
      else if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); pick(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto" style={{ background: `radial-gradient(ellipse at 30% 60%, ${style.color}33, transparent 55%), linear-gradient(180deg,#0d0b14,#1a1426)` }}>
      <div className="min-h-full max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6 flex flex-col gap-3 sm:gap-4">
        <h2 className="font-title text-2xl sm:text-5xl text-center uppercase pr-20 sm:pr-0" style={{ color: '#fde047', textShadow: '4px 4px 0 #7a3d00, 0 0 24px #f80' }}>Select your fighter</h2>

        <div className="grid gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] flex-1">
          {/* Preview: the sheet art for the 4 main fighters, the live model for custom ones */}
          <div className="relative mc-dark overflow-hidden flex flex-col gap-3 p-0" style={{ boxShadow: `inset 0 0 0 3px ${style.color}`, background: `radial-gradient(ellipse at 50% 80%, ${style.color}44, rgba(16,0,16,.95) 60%)` }}>
            <div key={sel.id} className="relative h-[12rem] sm:h-[16rem] lg:h-[19rem] w-full shrink-0 overflow-hidden select-art">
              {sel.art ? (
                <img src={sel.art} alt={`${sel.name} character art`} className={`absolute inset-0 w-full h-full ${artFit(sel.art)}`} />
              ) : (
                <div className="absolute inset-0 flex items-end justify-center pb-3">
                  <div className="absolute bottom-2 w-44 h-6 rounded-[50%] bg-black/60" style={{ boxShadow: `0 0 30px ${style.color}` }} />
                  <div className="relative"><Fighter f={sel} height={typeof window !== 'undefined' && window.innerHeight < 700 ? 150 : 220} pose={locked ? 'cheer' : 'idle'} /></div>
                </div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(11,10,16,.95), transparent 55%)' }} />
              {sel.art && !sel.art.startsWith('/sprites/') && (
                <div className="absolute right-2 bottom-2 sm:right-4 sm:bottom-3 flex flex-col items-center" title="In-game model">
                  <Fighter f={sel} height={84} pose={locked ? 'cheer' : 'idle'} />
                  <span className="font-pixel text-[10px] text-white/60 mt-0.5">in game</span>
                </div>
              )}
              <div className="absolute left-3 bottom-2 sm:left-5 sm:bottom-3 pr-24">
                <p className="font-title text-2xl sm:text-4xl text-white uppercase leading-none break-words" style={{ textShadow: `3px 3px 0 #000, 0 0 18px ${style.color}` }}>{sel.name}</p>
                <p className="font-title text-sm sm:text-lg uppercase mt-1" style={{ color: style.color, textShadow: '2px 2px 0 #000' }}>{style.icon} {style.label}</p>
                <p className="font-pixel text-sm sm:text-base text-white/90 italic">“{style.tagline}”</p>
              </div>
            </div>
            <div className="px-3 pb-3 sm:px-5 sm:pb-4 space-y-2.5">
              <p className="font-pixel text-sm sm:text-base text-white/80">{style.blurb}</p>
              <Stats style={style} />
              <div className="border-2 border-black px-2.5 py-1.5" style={{ background: `${style.color}33` }}>
                <p className="font-title text-xs sm:text-sm uppercase" style={{ color: style.color }}>{style.perk.icon} Perk: {style.perk.name}</p>
                <p className="font-pixel text-sm text-white/90 leading-snug">{style.perk.text}</p>
              </div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-left font-pixel text-xs sm:text-sm">
                {style.moves.map((m) => (
                  <li key={m.name} className="text-white/90 truncate" title={m.name}>
                    <span className="text-mcaqua">{KIND_ICON[m.kind]}</span> {m.name} <span className="text-mcgold">{'★'.repeat(m.tier)}</span>
                  </li>
                ))}
              </ul>
              <p className="font-pixel text-xs sm:text-sm text-mcred">⚡ Ultimate: <span className="text-white">{style.ultimate}</span></p>
            </div>
          </div>

          {/* Roster */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2" role="listbox" aria-label="Fighters">
              {roster.map((f) => {
                const on = f.id === sel.id;
                return (
                  <button
                    key={f.id}
                    role="option"
                    aria-selected={on}
                    onClick={() => choose(f.id)}
                    onDoubleClick={pick}
                    className={`relative overflow-hidden flex flex-col items-center justify-end h-28 sm:h-32 p-1.5 border-[3px] transition-transform ${on ? 'border-mcyellow -translate-y-1' : 'border-black hover:border-white/60'}`}
                    style={{ background: on ? `linear-gradient(180deg, ${STYLES[f.style].color}66, #1b1530)` : 'linear-gradient(180deg,#2a2440,#141020)', boxShadow: on ? `0 0 0 2px #000, 0 0 18px ${STYLES[f.style].color}` : 'inset 0 0 0 2px #3a3358' }}
                  >
                    {on && <span className="absolute z-10 top-1 left-1 font-title text-[10px] px-1 bg-mcyellow text-black">P1</span>}
                    {f.preset ? null : <span className="absolute top-1 right-1 font-pixel text-[10px] text-mcaqua">custom</span>}
                    {f.portrait ? (
                      <img src={f.portrait} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: on ? 1 : 0.75 }} />
                    ) : (
                      <Fighter f={f} height={64} />
                    )}
                    {f.portrait && <span className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: 'linear-gradient(0deg, #0b0a10, transparent)' }} />}
                    <span className="relative font-pixel text-xs sm:text-sm text-white truncate w-full text-center mt-1" style={{ textShadow: '1px 1px 0 #000' }}>{f.name}</span>
                    <span className="relative text-xs leading-none">{STYLES[f.style].icon}</span>
                  </button>
                );
              })}
              {canCreate && (
                <button onClick={create} className="flex flex-col items-center justify-center h-28 sm:h-32 border-[3px] border-dashed border-white/40 hover:border-mcyellow bg-black/30 text-white/80 hover:text-mcyellow">
                  <span className="font-title text-3xl leading-none">+</span>
                  <span className="font-pixel text-xs sm:text-sm mt-1">Create fighter</span>
                </button>
              )}
            </div>
            <p className="font-pixel text-xs sm:text-sm text-white/60">
              {custom.length}/{MAX_CUSTOM} custom fighters · arrows to browse · Enter to fight
            </p>
            {!sel.preset && (
              <div className="flex gap-2">
                <button className="mc-btn flex-1 !text-sm" onClick={() => { play('select'); setEditing(sel); }}>✎ Edit</button>
                <button className={`mc-btn flex-1 !text-sm ${confirmDelete ? '!bg-[#7a1f1f]' : ''}`} onClick={remove}>{confirmDelete ? 'Really delete?' : '🗑 Delete'}</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 sticky bottom-0 py-2" style={{ background: 'linear-gradient(0deg,#0d0b14,transparent)' }}>
          <button className="mc-btn" onClick={onBack}>◀ Back</button>
          <button className="mc-btn mc-btn-green flex-1 text-lg sm:text-2xl" onClick={pick} disabled={!!locked}>⚔ Fight as {sel.name}</button>
        </div>
      </div>

      {locked && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${locked.accent}55, rgba(0,0,0,.75) 70%)` }}>
          <p className="cue-ready font-title text-xl sm:text-3xl text-white uppercase tracking-widest mc-text-dark" style={{ animationDuration: '1.3s' }}>Fighter locked in</p>
          <p className="cue-fight font-title text-5xl sm:text-8xl uppercase text-mcyellow text-center px-4" style={{ animationDuration: '1.3s', textShadow: '5px 5px 0 #7a3d00, 0 0 30px #ff0' }}>{locked.name}</p>
        </div>
      )}
      {editing && <Creator initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  );
}
