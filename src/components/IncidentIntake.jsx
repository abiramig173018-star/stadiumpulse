import { useState } from "react";
import BroadcastTranslator from "./BroadcastTranslator";
import { postJson } from "../lib/apiClient";

const SEVERITY_STYLES = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};

/**
 * Free-text incident report → structured GenAI alert card.
 * Posts to /api/analyze-incident with the report + live zone data, so the
 * model's answer is grounded in what's actually happening right now rather
 * than general knowledge. Calls `onNewIncident` with each successful
 * analysis so Dashboard can feed real incident history into the shift
 * briefing, not just auto-generated zone alerts.
 */
export default function IncidentIntake({ zones, onNewIncident }) {
  const [report, setReport] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!report.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await postJson("/api/analyze-incident", { report, zones });

      setAnalysis(data);
      setReport("");
      onNewIncident?.({ ...data, reportedAt: new Date() });
    } catch (err) {
      setError(err.message || "Couldn't reach the analysis service. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleAnalyze();
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 id="incident-heading" className="text-sm font-semibold text-slate-200 mb-3">
        Report an incident
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={report}
          onChange={(e) => setReport(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Someone fainted near Gate A, needs medical"
          aria-labelledby="incident-heading"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !report.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors shrink-0"
        >
          {isAnalyzing ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      <p role="status" aria-live="polite" className={error ? "mt-3 text-sm text-red-400" : "sr-only"}>
        {error || ""}
      </p>

      {analysis && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 p-4 bg-slate-950/60 rounded-lg border border-indigo-500/20"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Structured alert
            </h3>
            <button
              onClick={() => setAnalysis(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-sm">
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider mb-0.5">Zone</span>
              <span className="text-slate-200 font-medium">{analysis.zone}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider mb-0.5">Severity</span>
              <span className={`font-medium capitalize ${SEVERITY_STYLES[analysis.severity] ?? "text-slate-200"}`}>
                {analysis.severity}
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider mb-0.5">Category</span>
              <span className="text-slate-200 font-medium capitalize">{analysis.category}</span>
            </div>
          </div>

          <div className="text-sm mb-1">
            <span className="block text-xs text-slate-500 uppercase tracking-wider mb-0.5">
              Recommended action
            </span>
            <span className="text-slate-200 leading-relaxed">{analysis.recommendedAction}</span>
          </div>

          {analysis.broadcastMessage && (
            <BroadcastTranslator
              key={analysis.broadcastMessage}
              message={analysis.broadcastMessage}
            />
          )}
        </div>
      )}
    </div>
  );
}
