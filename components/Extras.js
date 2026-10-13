import { TOOLKIT, findQuestion } from '@/lib/bosses.mjs';

export function StudyNotes({ missed, open }) {
  const items = missed.map(findQuestion).filter(Boolean);
  if (!items.length) return null;
  return (
    <details className="panel p-3" open={open}>
      <summary className="font-pixel text-[10px] text-bad cursor-pointer">📝 STUDY NOTES: {items.length} MISSED</summary>
      <ul className="mt-3 space-y-3">
        {items.map(({ boss, q }) => (
          <li key={q.id} className="text-lg border-l-4 pl-3" style={{ borderColor: boss.color }}>
            <p className="text-gray-400 text-base">{boss.name} · {q.kind === 'tool' ? 'AI tool' : 'Workflow'}</p>
            <p className="text-white">{q.scenario}</p>
            <p className="text-good">✔ {q.options.find((o) => o.correct).text}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Toolkit() {
  return (
    <details className="panel p-3">
      <summary className="font-pixel text-[10px] text-cyanx cursor-pointer">🧰 AI TOOLKIT CHEAT SHEET</summary>
      <ul className="mt-3 grid sm:grid-cols-2 gap-2">
        {TOOLKIT.map((t) => (
          <li key={t.job} className="bg-black/30 border-2 border-black p-2 text-lg leading-tight">
            <span className="mr-1">{t.icon}</span>
            <b className="text-white">{t.job}</b>
            <br />
            <span className="text-gray-400 text-base">{t.tools}</span>
          </li>
        ))}
      </ul>
      <p className="text-base text-gray-500 mt-2">
        Always use tools your company has approved, and check what they produce. Tool names are examples, not endorsements.
      </p>
    </details>
  );
}

export function Cabinet({ children }) {
  return (
    <div
      className="relative sm:p-4 sm:pb-6 sm:rounded-t-[2rem] sm:border-[3px] sm:border-black sm:animate-glow"
      style={{ background: 'linear-gradient(180deg, #4c1d95 0%, #2e1065 40%, #1e1b4b 100%)' }}
    >
      <div className="hidden sm:block mb-3 border-[3px] border-black bg-black overflow-hidden" style={{ boxShadow: 'inset 0 0 20px rgba(251,191,36,.35)' }}>
        <div className="flex w-max whitespace-nowrap animate-marquee py-1.5 font-pixel text-[10px] text-gold">
          {[0, 1].map((k) => (
            <span key={k} className="px-4">
              ★ OFFICE BOSS FIGHT ★ DEFEAT THE INBOX HYDRA ★ OUTSMART THE EXCEL MONSTER ★ BANISH THE MEETING DEMON ★ EXORCISE THE PPT PHANTOM ★ SLAY THE DEADLINE DRAGON
            </span>
          ))}
        </div>
      </div>
      <div
        className="relative bg-navy sm:border-[6px] sm:border-black sm:rounded-lg p-3 sm:p-5 min-h-[100dvh] sm:min-h-0"
        style={{ boxShadow: 'inset 0 0 60px rgba(34,211,238,0.12)' }}
      >
        {children}
      </div>
      <div className="hidden sm:flex items-center justify-center gap-6 mt-4" aria-hidden>
        <div className="w-10 h-10 rounded-full bg-black border-[3px] border-black relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-3 h-7 bg-gray-700 border-2 border-black" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 border-[3px] border-black" />
        </div>
        {['#22d3ee', '#a855f7', '#4ade80', '#fbbf24'].map((c) => (
          <div key={c} className="w-7 h-7 rounded-full border-[3px] border-black" style={{ background: c, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.35)' }} />
        ))}
      </div>
    </div>
  );
}
