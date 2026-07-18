import { useEffect, useRef, useState } from "react";
import { gaugeLevelForRatio } from "./gauge";

/**
 * Derives a live alert feed purely from zone state changes — no backend or
 * GenAI call yet (that's Step 4). It diffs each 5s tick against the last one
 * and emits an alert when a zone spikes or crosses a gauge threshold
 * (green→amber→red, or eases back down). This keeps the alert panel feeling
 * "live" from day one; in Step 4, GenAI-generated alerts from free-text
 * incident reports will push into this same feed shape.
 */

const MAX_ALERTS = 30;
const LEVEL_RANK = { green: 0, amber: 1, red: 2 };

function makeAlertId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function diffAlerts(prevZones, nextZones) {
  const prevById = Object.fromEntries(prevZones.map((z) => [z.id, z]));
  const alerts = [];

  for (const zone of nextZones) {
    const prev = prevById[zone.id];
    if (!prev) continue;

    const prevLevel = gaugeLevelForRatio(prev.ratio);
    const nextLevel = gaugeLevelForRatio(zone.ratio);
    const pct = Math.round(zone.ratio * 100);

    if (zone.spiked) {
      alerts.push({
        id: makeAlertId(),
        timestamp: new Date(),
        zoneId: zone.id,
        zoneName: zone.name,
        level: nextLevel === "green" ? "amber" : nextLevel,
        message: `Sudden crowd spike at ${zone.name} — now ${pct}% capacity.`,
      });
      continue; // spike alert already covers this tick, skip the duplicate below
    }

    if (LEVEL_RANK[nextLevel] > LEVEL_RANK[prevLevel]) {
      alerts.push({
        id: makeAlertId(),
        timestamp: new Date(),
        zoneId: zone.id,
        zoneName: zone.name,
        level: nextLevel,
        message:
          nextLevel === "red"
            ? `${zone.name} exceeded 85% capacity (${pct}%). Consider slowing entry.`
            : `${zone.name} entering moderate congestion (${pct}%).`,
      });
    } else if (LEVEL_RANK[nextLevel] < LEVEL_RANK[prevLevel] && prevLevel !== "green") {
      alerts.push({
        id: makeAlertId(),
        timestamp: new Date(),
        zoneId: zone.id,
        zoneName: zone.name,
        level: "info",
        message: `${zone.name} easing — down to ${pct}% capacity.`,
      });
    }
  }

  return alerts;
}

/** Feed this the `zones` array from useCrowdData(). Returns the current
 * alert list, newest first, capped at MAX_ALERTS. */
export function useAlertFeed(zones) {
  const [alerts, setAlerts] = useState(() => [
    {
      id: makeAlertId(),
      timestamp: new Date(),
      zoneId: null,
      zoneName: "System",
      level: "info",
      message: "Live monitoring started — 8 zones online.",
    },
  ]);
  const prevZonesRef = useRef(null);

  useEffect(() => {
    if (prevZonesRef.current) {
      const newAlerts = diffAlerts(prevZonesRef.current, zones);
      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts.reverse(), ...prev].slice(0, MAX_ALERTS));
      }
    }
    prevZonesRef.current = zones;
  }, [zones]);

  return alerts;
}
