import { useState } from "react";
import { useCrowdData } from "../lib/crowdSimulator";
import { useAlertFeed } from "../lib/alertFeed";
import ZoneGrid from "./ZoneGrid";
import AlertFeed from "./AlertFeed";
import IncidentIntake from "./IncidentIntake";
import ShiftBriefing from "./ShiftBriefing";
import ErrorBoundary from "./ErrorBoundary";
import GenAIExplainer from "./GenAIExplainer";

const MAX_INCIDENT_HISTORY = 10;

export default function Dashboard() {
  const { zones, lastUpdated } = useCrowdData();
  const alerts = useAlertFeed(zones);
  const [incidentHistory, setIncidentHistory] = useState([]);

  function handleNewIncident(incident) {
    setIncidentHistory((prev) => [incident, ...prev].slice(0, MAX_INCIDENT_HISTORY));
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">StadiumPulse</h1>
            <p className="text-xs text-slate-500">
              Live capacity · updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Monitoring
          </span>
        </header>

        <GenAIExplainer />

        <ErrorBoundary>
          <IncidentIntake zones={zones} onNewIncident={handleNewIncident} />
        </ErrorBoundary>

        <ErrorBoundary>
          <ShiftBriefing zones={zones} alerts={alerts} incidents={incidentHistory} />
        </ErrorBoundary>

        <main className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
          <section aria-label="Zone occupancy">
            <ZoneGrid zones={zones} />
          </section>
          <ErrorBoundary>
            <AlertFeed alerts={alerts} />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
