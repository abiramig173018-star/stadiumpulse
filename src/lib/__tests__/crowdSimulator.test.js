import { describe, it, expect } from "vitest";
import {
  createInitialZones,
  stepZone,
  severityForRatio,
  ZONE_DEFINITIONS,
} from "../crowdSimulator";

describe("createInitialZones", () => {
  it("creates all 8 defined zones", () => {
    const zones = createInitialZones();
    expect(zones).toHaveLength(ZONE_DEFINITIONS.length);
    expect(zones.map((z) => z.id).sort()).toEqual(
      ZONE_DEFINITIONS.map((z) => z.id).sort()
    );
  });

  it("starts every zone within capacity", () => {
    for (const zone of createInitialZones()) {
      expect(zone.occupancy).toBeGreaterThanOrEqual(0);
      expect(zone.occupancy).toBeLessThanOrEqual(zone.capacity);
    }
  });
});

describe("stepZone", () => {
  it("never pushes occupancy below 0 or above capacity, even after many steps", () => {
    let zone = { id: "test", name: "Test Zone", capacity: 1000, occupancy: 500 };
    for (let i = 0; i < 500; i++) {
      zone = stepZone(zone);
      expect(zone.occupancy).toBeGreaterThanOrEqual(0);
      expect(zone.occupancy).toBeLessThanOrEqual(zone.capacity);
    }
  });

  it("keeps ratio consistent with occupancy/capacity", () => {
    const zone = { id: "test", name: "Test Zone", capacity: 1000, occupancy: 500 };
    const next = stepZone(zone);
    expect(next.ratio).toBeCloseTo(next.occupancy / next.capacity);
  });

  it("sets trend to rising, falling, or steady", () => {
    const zone = { id: "test", name: "Test Zone", capacity: 1000, occupancy: 500 };
    const next = stepZone(zone);
    expect(["rising", "falling", "steady"]).toContain(next.trend);
  });
});

describe("severityForRatio", () => {
  it("matches the 4-tier thresholds used for GenAI prompts", () => {
    expect(severityForRatio(0.5)).toBe("low");
    expect(severityForRatio(0.7)).toBe("medium");
    expect(severityForRatio(0.9)).toBe("high");
    expect(severityForRatio(0.97)).toBe("critical");
  });
});
