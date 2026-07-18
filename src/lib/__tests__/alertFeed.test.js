import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAlertFeed } from "../alertFeed";

describe("useAlertFeed", () => {
  it("starts with a single system alert", () => {
    const zones = [{ id: "gate-a", name: "Gate A", capacity: 100, ratio: 0.3, spiked: false }];
    const { result } = renderHook(() => useAlertFeed(zones));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].zoneName).toBe("System");
  });

  it("emits an alert when a zone crosses green into amber", () => {
    const zoneLow = { id: "gate-a", name: "Gate A", capacity: 100, ratio: 0.4, spiked: false };
    const { result, rerender } = renderHook(({ zones }) => useAlertFeed(zones), {
      initialProps: { zones: [zoneLow] },
    });

    const zoneHigh = { ...zoneLow, ratio: 0.7 };
    act(() => {
      rerender({ zones: [zoneHigh] });
    });

    const crossingAlert = result.current.find((a) => a.zoneName === "Gate A");
    expect(crossingAlert).toBeDefined();
    expect(crossingAlert.level).toBe("amber");
  });

  it("emits a spike alert regardless of threshold crossing", () => {
    const zoneBefore = { id: "gate-a", name: "Gate A", capacity: 100, ratio: 0.3, spiked: false };
    const { result, rerender } = renderHook(({ zones }) => useAlertFeed(zones), {
      initialProps: { zones: [zoneBefore] },
    });

    const zoneSpiked = { ...zoneBefore, ratio: 0.35, spiked: true };
    act(() => {
      rerender({ zones: [zoneSpiked] });
    });

    const spikeAlert = result.current.find((a) => a.message.includes("spike"));
    expect(spikeAlert).toBeDefined();
  });
});
