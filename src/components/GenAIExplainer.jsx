import { useState } from "react";

const PILLARS = [
  {
    label: "Crowd management & real-time decision support",
    detail:
      "Zone occupancy is monitored continuously; staff-submitted reports are analyzed by Gemini and grounded in that live data, not general knowledge, to produce an immediate, actionable alert.",
  },
  {
    label: "Multilingual assistance",
    detail:
      "Any broadcast message can be translated on demand for international volunteer teams, preserving urgency and tone for public announcements.",
  },
  {
    label: "Operational intelligence",
    detail:
      "An on-demand shift briefing summarizes current risk zones and recent incidents into a handover a supervisor can read in seconds.",
  },
];

/**
 * A small collapsible panel making the GenAI pipeline and its mapping to
 * the brief's focus areas explicit, rather than leaving it implicit in
 * the UI. Collapsed by default so it doesn't compete for attention with
 * the live operational data.
 */
export default function GenAIExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:text-slate-100"
      >
        <span className="font-medium">How this uses Generative AI</span>
        <span className="text-slate-500">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.label} className="text-sm">
              <p className="text-slate-200 font-medium mb-0.5">{pillar.label}</p>
              <p className="text-slate-500 leading-relaxed">{pillar.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
