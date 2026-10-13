import { TOOLKIT, GOLDEN_RULES, QUESTION_TYPES, findQuestion } from '@/lib/bosses.mjs';
import World from './World';
import { tex } from '@/lib/textures';

export function StudyNotes({ missed, open }) {
  const items = [...new Set(missed)].map(findQuestion).filter(Boolean);
  if (!items.length) return null;
  return (
    <details className="mc-dark p-3" open={open}>
      <summary className="font-pixel text-base text-mcred cursor-pointer">📖 Study notes: {items.length} missed</summary>
      <ul className="mt-3 space-y-3">
        {items.map(({ boss, q }) => (
          <li key={q.id} className="font-pixel text-base border-l-4 pl-3 leading-snug" style={{ borderColor: boss.color }}>
            <p className="text-mcgray text-sm">{boss.name} · {QUESTION_TYPES[q.type]?.icon} {QUESTION_TYPES[q.type]?.label}</p>
            <p className="text-white">{q.scenario}</p>
            <p className="text-mcgreen">✔ {q.options.find((o) => o.correct).text}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Toolkit() {
  return (
    <details className="mc-dark p-3" open>
      <summary className="font-pixel text-base text-mcaqua cursor-pointer">🤖 What AI can do for you</summary>
      <div className="mt-3 mc-panel p-3">
        <p className="font-title text-sm text-[#5b2a86] mb-1">⭐ 4 golden rules</p>
        <ol className="font-pixel space-y-1 text-base leading-snug list-decimal pl-5 text-[#2b2b2b]">
          {GOLDEN_RULES.map((r) => <li key={r}>{r}</li>)}
        </ol>
      </div>
      <ul className="mt-3 grid sm:grid-cols-2 gap-2">
        {TOOLKIT.map((t) => (
          <li key={t.job} className="bg-black/40 border-2 border-black p-2 font-pixel text-base leading-tight">
            <span className="mr-1">{t.icon}</span>
            <b className="text-white">{t.job}</b>
            <br />
            <span className="text-mcgray text-sm">{t.tools}</span>
          </li>
        ))}
      </ul>
      <p className="font-pixel text-sm text-mcgray mt-2">
        Examples from the game, not endorsements. Tools change fast. At work, use the ones your company has approved.
      </p>
    </details>
  );
}

/** Full-screen frame. The title and results screens sit on a living Minecraft world; battles get a dark dirt backdrop. */
export function Screen({ biome, dim = false, children }) {
  return (
    <div className="relative min-h-[100dvh] w-full">
      <div className="fixed inset-0">
        {dim ? (
          // Plain dark stone "dirt menu" backdrop, so the battle stays the focus.
          <div className="absolute inset-0" style={tex('deepslate', 64, { filter: 'brightness(.55)' })} />
        ) : (
          <World biome={biome} block={56} />
        )}
      </div>
      <div className="relative mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-10 pt-3 sm:pt-6 pb-8">{children}</div>
    </div>
  );
}
