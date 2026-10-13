export function HpBar({ label, value, max = 100, color, right }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between font-pixel text-[10px] sm:text-xs mb-1">
        <span>{label}</span>
        <span>{right ?? `${value}/${max}`}</span>
      </div>
      <div className="bar" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemax={max}>
        <div style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
