import { describe, it, expect } from "vitest";
import { calculateCostSummary } from "./calculations";

describe("calculateCostSummary", () => {
  it("computes HPP from flat + per-pax components", () => {
    const summary = calculateCostSummary(
      [
        { amount: 3_000_000, qty: 1, unit: "FLAT" }, // bus
        { amount: 150_000, qty: 1, unit: "PER_PAX" }, // konsumsi per pax
      ],
      10,
      500_000
    );

    expect(summary.totalFlat).toBe(3_000_000);
    expect(summary.totalPerPaxUnit).toBe(150_000);
    expect(summary.hpp).toBe(3_000_000 + 150_000 * 10);
    expect(summary.costPerPax).toBe(summary.hpp / 10);
    expect(summary.marginPerPax).toBe(500_000 - summary.costPerPax);
  });

  it("applies qty as a multiplier per component", () => {
    const summary = calculateCostSummary(
      [{ amount: 100_000, qty: 3, unit: "FLAT" }],
      5,
      100_000
    );
    expect(summary.totalFlat).toBe(300_000);
  });

  it("returns zero cost per pax when there are no participants", () => {
    const summary = calculateCostSummary(
      [{ amount: 1_000_000, qty: 1, unit: "FLAT" }],
      0,
      100_000
    );
    expect(summary.costPerPax).toBe(0);
    expect(summary.marginPerPax).toBe(100_000);
  });

  it("computes BEP pax from flat cost divided by contribution margin", () => {
    const summary = calculateCostSummary(
      [
        { amount: 2_000_000, qty: 1, unit: "FLAT" },
        { amount: 100_000, qty: 1, unit: "PER_PAX" },
      ],
      20,
      300_000
    );
    // contribution per pax = 300_000 - 100_000 = 200_000
    // BEP = 2_000_000 / 200_000 = 10
    expect(summary.bepPax).toBe(10);
  });

  it("returns null BEP when variable cost exceeds selling price", () => {
    const summary = calculateCostSummary(
      [
        { amount: 1_000_000, qty: 1, unit: "FLAT" },
        { amount: 400_000, qty: 1, unit: "PER_PAX" },
      ],
      10,
      300_000 // lower than variable cost per pax -> never breaks even
    );
    expect(summary.bepPax).toBeNull();
  });
});
