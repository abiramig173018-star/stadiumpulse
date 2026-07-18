/**
 * UI-facing capacity gauge thresholds — deliberately simpler (3 levels) than
 * the 4-level `severityForRatio()` in crowdSimulator.js, which feeds the
 * GenAI alert/briefing prompts in later steps. Keeping these separate means
 * changing the dashboard's color thresholds never risks changing what the
 * AI considers "critical."
 */
export function gaugeLevelForRatio(ratio) {
  if (ratio > 0.85) return "red";
  if (ratio >= 0.6) return "amber";
  return "green";
}

export const GAUGE_COLORS = {
  green: {
    bar: "bg-emerald-400",
    text: "text-emerald-400",
    ring: "ring-emerald-400/20",
  },
  amber: {
    bar: "bg-amber-400",
    text: "text-amber-400",
    ring: "ring-amber-400/20",
  },
  red: {
    bar: "bg-red-500",
    text: "text-red-400",
    ring: "ring-red-500/30",
  },
};
