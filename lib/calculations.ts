import type { CostUnit } from "./types";

export interface CostComponentInput {
  amount: number;
  qty: number;
  unit: CostUnit | string;
}

export interface CostSummary {
  totalFlat: number;
  totalPerPaxUnit: number;
  hpp: number;
  costPerPax: number;
  pricePerPax: number | null;
  marginPerPax: number | null;
  marginTotal: number | null;
  bepPax: number | null;
}

export function calculateCostSummary(
  components: CostComponentInput[],
  actualPax: number,
  pricePerPax: number | null
): CostSummary {
  const totalFlat = components
    .filter((c) => c.unit === "FLAT")
    .reduce((sum, c) => sum + c.amount * c.qty, 0);

  const totalPerPaxUnit = components
    .filter((c) => c.unit === "PER_PAX")
    .reduce((sum, c) => sum + c.amount * c.qty, 0);

  const pax = Math.max(actualPax, 0);
  const hpp = totalFlat + totalPerPaxUnit * pax;
  const costPerPax = pax > 0 ? hpp / pax : 0;

  const marginPerPax = pricePerPax === null ? null : pricePerPax - costPerPax;
  const marginTotal = marginPerPax === null ? null : marginPerPax * pax;

  const contributionPerPax =
    pricePerPax === null ? null : pricePerPax - totalPerPaxUnit;
  const bepPax =
    contributionPerPax !== null && contributionPerPax > 0
      ? totalFlat / contributionPerPax
      : null;

  return {
    totalFlat,
    totalPerPaxUnit,
    hpp,
    costPerPax,
    pricePerPax,
    marginPerPax,
    marginTotal,
    bepPax,
  };
}
