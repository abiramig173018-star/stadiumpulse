import { gaugeLevelForRatio, GAUGE_COLORS } from "../lib/gauge";

const TREND_ARROW = { rising: "↑", falling: "↓", steady: "→" };

export default function ZoneCard({ zone }) {
  const level = gaugeLevelForRatio(zone.ratio);
  const colors = GAUGE_COLORS[level];
  const pct = Math.round(zone.ratio * 100);

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 ring-1 ${colors.ring}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-200 text-sm font-medium">{zone.name}</span>
        <span className={`text-xs font-semibold flex items-center gap-1 ${colors.text}`}>
          {pct}%
          <span aria-hidden>{TREND_ARROW[zone.trend]}</span>
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {zone.occupancy.toLocaleString()} / {zone.capacity.toLocaleString()}
        </span>
        {zone.spiked && <span className="text-orange-400 font-medium">spike</span>}
      </div>
    </div>
  );
}
