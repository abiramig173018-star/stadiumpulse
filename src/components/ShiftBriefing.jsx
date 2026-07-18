import { useState } from "react";
import { postJson } from "../lib/apiClient";

/**
 * "Generate briefing" — summarizes current zone occupancy, recent
 * auto-generated zone alerts, and recent staff-submitted incidents into
 * a short shift-handover summary via /api/briefing. Generated on demand
 * rather than automatically, since a supervisor should decide when they
 * want a fresh read of the room.
 */
export default function ShiftBriefing({ zones, alerts, incidents }) {
  const [bullets, setBullets] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await postJson("/api/briefing", { zones, alerts, incidents });

      setBullets(data.bullets);
      setGeneratedAt(new Date(data.generatedAt));
    } catch (err) {
      setError(err.message || "Couldn't generate a briefing. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Shift briefing</h2>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {isLoading ? "Generating…" : bullets ? "Regenerate" : "Generate briefing"}
        </button>
      </div>

      {generatedAt && (
        <p className="text-xs text-slate-500 mt-1">
          As of {generatedAt.toLocaleTimeString()}
        </p>
      )}

      <div role="status" aria-live="polite">
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

        {bullets && (
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300 list-disc list-inside">
            {bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>

      {!bullets && !isLoading && !error && (
        <p className="text-sm text-slate-500 mt-1">
          Summarizes current risk zones and incidents for handover — generated on demand.
        </p>
      )}
    </div>
  );
}
