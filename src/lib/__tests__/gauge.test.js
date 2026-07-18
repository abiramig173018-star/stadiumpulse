import { describe, it, expect } from "vitest";
import { gaugeLevelForRatio, GAUGE_COLORS } from "../gauge";

describe("gaugeLevelForRatio", () => {
  it("returns green under 60%", () => {
    expect(gaugeLevelForRatio(0)).toBe("green");
    expect(gaugeLevelForRatio(0.3)).toBe("green");
    expect(gaugeLevelForRatio(0.59)).toBe("green");
  });

  it("returns amber between 60% and 85% inclusive of 60", () => {
    expect(gaugeLevelForRatio(0.6)).toBe("amber");
    expect(gaugeLevelForRatio(0.75)).toBe("amber");
    expect(gaugeLevelForRatio(0.85)).toBe("amber");
  });

  it("returns red above 85%", () => {
    expect(gaugeLevelForRatio(0.86)).toBe("red");
    expect(gaugeLevelForRatio(1)).toBe("red");
  });

  it("has a color entry for every level it can return", () => {
    for (const ratio of [0, 0.3, 0.6, 0.85, 0.86, 1]) {
      const level = gaugeLevelForRatio(ratio);
      expect(GAUGE_COLORS[level]).toBeDefined();
    }
  });
});
