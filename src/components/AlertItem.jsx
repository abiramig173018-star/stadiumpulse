const LEVEL_STYLES = {
  red: { dot: "bg-red-500", label: "text-red-400" },
  amber: { dot: "bg-amber-400", label: "text-amber-400" },
  green: { dot: "bg-emerald-400", label: "text-emerald-400" },
  info: { dot: "bg-slate-500", label: "text-slate-400" },
};

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AlertItem({ alert }) {
  const style = LEVEL_STYLES[alert.level] ?? LEVEL_STYLES.info;

  return (
    <div className="flex gap-2.5 py-2.5 border-b border-slate-800/70 last:border-b-0">
      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs mb-0.5">
          <span className={`font-semibold ${style.label}`}>{alert.zoneName}</span>
          <span className="text-slate-600">{formatTime(alert.timestamp)}</span>
        </div>
        <p className="text-sm text-slate-300 leading-snug">{alert.message}</p>
      </div>
    </div>
  );
}
