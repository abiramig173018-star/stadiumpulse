import { useEffect, useRef, useState } from "react";

/**
 * StadiumPulse — crowd simulation engine.
 *
 * There's no real sensor feed yet, so this module fakes a believable one:
 * each zone's occupancy does a random walk (small realistic fluctuations)
 * with an occasional larger "spike" (a gate rush, a goal, halftime surge).
 * Swap `stepZone` for a real API call later without touching the hook's
 * public shape (`useCrowdData()` returns the same `{ zones, lastUpdated }`).
 */

// --- Zone definitions -------------------------------------------------

export const ZONE_DEFINITIONS = [
  { id: "gate-a", name: "Gate A", capacity: 700 },
  { id: "gate-b", name: "Gate B", capacity: 700 },
  { id: "gate-c", name: "Gate C", capacity: 650 },
  { id: "gate-d", name: "Gate D", capacity: 650 },
  { id: "north-stand", name: "North Stand", capacity: 5200 },
  { id: "south-stand", name: "South Stand", capacity: 5200 },
  { id: "concourse-east", name: "Concourse East", capacity: 1400 },
  { id: "concourse-west", name: "Concourse West", capacity: 1400 },
];

// --- Tunables -----------------------------------------------------------

const UPDATE_INTERVAL_MS = 5000;

// Random walk: each tick, occupancy moves by up to ±3% of capacity.
const DRIFT_RATIO = 0.03;

// Spikes: rare, larger jumps that simulate a gate rush / crowd surge.
const SPIKE_CHANCE = 0.08; // 8% chance per zone per tick
const SPIKE_RATIO_MIN = 0.08; // spike moves occupancy by 8-18% of capacity
const SPIKE_RATIO_MAX = 0.18;
const SPIKE_DIRECTION_UP_BIAS = 0.75; // spikes are more often surges than drains

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Returns a severity label for a given occupancy ratio (0-1). Used by the
 * dashboard for gauge color and by the GenAI layer for alert prioritization. */
export function severityForRatio(ratio) {
  if (ratio >= 0.95) return "critical";
  if (ratio >= 0.85) return "high";
  if (ratio >= 0.6) return "medium";
  return "low";
}

/** Builds the starting zone state — moderate, slightly varied occupancy so
 * the dashboard doesn't open on a flat, obviously-fake 0%. */
export function createInitialZones() {
  return ZONE_DEFINITIONS.map((zone) => {
    const startRatio = randomBetween(0.3, 0.55);
    const occupancy = Math.round(zone.capacity * startRatio);
    return {
      ...zone,
      occupancy,
      ratio: occupancy / zone.capacity,
      severity: severityForRatio(occupancy / zone.capacity),
      trend: "steady", // "rising" | "falling" | "steady" — set on each tick
    };
  });
}

/** Advances a single zone by one tick: random walk, with an occasional spike. */
export function stepZone(zone) {
  const isSpike = Math.random() < SPIKE_CHANCE;

  let delta;
  if (isSpike) {
    const magnitude = randomBetween(SPIKE_RATIO_MIN, SPIKE_RATIO_MAX) * zone.capacity;
    const goesUp = Math.random() < SPIKE_DIRECTION_UP_BIAS;
    delta = goesUp ? magnitude : -magnitude;
  } else {
    delta = randomBetween(-DRIFT_RATIO, DRIFT_RATIO) * zone.capacity;
  }

  const nextOccupancy = Math.round(clamp(zone.occupancy + delta, 0, zone.capacity));
  const nextRatio = nextOccupancy / zone.capacity;

  let trend = "steady";
  if (nextOccupancy > zone.occupancy + 2) trend = "rising";
  else if (nextOccupancy < zone.occupancy - 2) trend = "falling";

  return {
    ...zone,
    occupancy: nextOccupancy,
    ratio: nextRatio,
    severity: severityForRatio(nextRatio),
    trend,
    spiked: isSpike,
  };
}

function stepAllZones(zones) {
  return zones.map(stepZone);
}

// --- React hook -----------------------------------------------------------

/**
 * Live crowd data for all zones, ticking every `intervalMs` (default 5s).
 *
 * const { zones, lastUpdated } = useCrowdData();
 *
 * Each zone: { id, name, capacity, occupancy, ratio, severity, trend, spiked }
 */
export function useCrowdData(intervalMs = UPDATE_INTERVAL_MS) {
  const [zones, setZones] = useState(createInitialZones);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setZones((prev) => stepAllZones(prev));
      setLastUpdated(new Date());
    }, intervalMs);

    return () => clearInterval(intervalRef.current);
  }, [intervalMs]);

  return { zones, lastUpdated };
}
