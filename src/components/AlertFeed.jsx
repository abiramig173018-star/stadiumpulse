import AlertItem from "./AlertItem";

export default function AlertFeed({ alerts }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col h-full max-h-[600px]">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h2 id="alert-feed-heading" className="text-sm font-semibold text-slate-200">
          Live Alerts
        </h2>
        <span className="text-xs text-slate-500">{alerts.length}</span>
      </div>
      <div
        role="log"
        aria-live="polite"
        aria-labelledby="alert-feed-heading"
        className="flex-1 overflow-y-auto px-4"
      >
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No alerts yet.</p>
        ) : (
          alerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
}
