/**
 * Plain TypeScript deterministic calculations for all money and hours.
 * Model output is NEVER used for monetary or hour arithmetic.
 */

export interface WorkItemHourSpec {
  hoursLow: number;
  hoursLikely: number;
  hoursHigh: number;
}

export interface HiddenCostsSpec {
  revisionsHours?: number;
  meetingsHours?: number;
  backAndForthHours?: number;
  delayedPaymentCost?: number;
  toolsCost?: number;
  taxesPercentage?: number;
}

export interface ComputedDealMath {
  totalHoursLow: number;
  totalHoursLikely: number;
  totalHoursHigh: number;
  hiddenHours: number;
  totalEffectiveHours: number;
  budgetAmount: number;
  hourlyMinimum: number;
  effectiveHourlyRate: number;
  rateDelta: number;
  isBelowMinimum: boolean;
  suggestedCounterOfferAmount: number;
}

export function computeDealMath(params: {
  workItems: WorkItemHourSpec[];
  budgetAmount: number;
  hourlyMinimum: number;
  hiddenCosts?: HiddenCostsSpec;
}): ComputedDealMath {
  const { workItems, budgetAmount, hourlyMinimum, hiddenCosts } = params;

  let totalHoursLow = 0;
  let totalHoursLikely = 0;
  let totalHoursHigh = 0;

  for (const item of workItems) {
    totalHoursLow += Math.max(0, Number(item.hoursLow) || 0);
    totalHoursLikely += Math.max(0, Number(item.hoursLikely) || 0);
    totalHoursHigh += Math.max(0, Number(item.hoursHigh) || 0);
  }

  // Factor in hidden cost hours (revisions, sync meetings, back & forth)
  const revHours = Math.max(0, Number(hiddenCosts?.revisionsHours) || 0);
  const meetHours = Math.max(0, Number(hiddenCosts?.meetingsHours) || 0);
  const bnfHours = Math.max(0, Number(hiddenCosts?.backAndForthHours) || 0);
  const hiddenHours = revHours + meetHours + bnfHours;

  const totalEffectiveHours = Math.max(1, totalHoursLikely + hiddenHours);
  const effectiveHourlyRate = Math.round((budgetAmount / totalEffectiveHours) * 100) / 100;
  const rateDelta = Math.round((effectiveHourlyRate - hourlyMinimum) * 100) / 100;
  const isBelowMinimum = effectiveHourlyRate < hourlyMinimum;

  // Counter offer: ensures total effective hours are paid at least at hourly minimum + buffer for taxes/tools
  const taxFactor = 1 + (Math.max(0, Number(hiddenCosts?.taxesPercentage) || 0) / 100);
  const toolsCost = Math.max(0, Number(hiddenCosts?.toolsCost) || 0);
  const baseFairBudget = totalEffectiveHours * hourlyMinimum + toolsCost;
  const suggestedCounterOfferAmount = Math.round(baseFairBudget * taxFactor);

  return {
    totalHoursLow: Math.round(totalHoursLow * 10) / 10,
    totalHoursLikely: Math.round(totalHoursLikely * 10) / 10,
    totalHoursHigh: Math.round(totalHoursHigh * 10) / 10,
    hiddenHours: Math.round(hiddenHours * 10) / 10,
    totalEffectiveHours: Math.round(totalEffectiveHours * 10) / 10,
    budgetAmount,
    hourlyMinimum,
    effectiveHourlyRate,
    rateDelta,
    isBelowMinimum,
    suggestedCounterOfferAmount,
  };
}

/**
 * Checks numbers in draft text against computed numbers.
 * Ensures the model does not hallucinate arbitrary pricing or rate figures in drafts.
 */
export function verifyDraftAmounts(
  draftText: string,
  math: ComputedDealMath,
  currencySymbol = "$"
): { isGrounded: boolean; flaggedNumbers: number[]; groundedNumbers: number[] } {
  if (!draftText) {
    return { isGrounded: true, flaggedNumbers: [], groundedNumbers: [] };
  }

  // Find all currency figures like $5,000, Rs. 5000, INR 5000, 5000 USD
  const currencyRegex = /(?:[\$₹£€]|(?:rs\.?|inr|usd)\s*)(\d+(?:,\d{3})*(?:\.\d+)?)/gi;
  const matches: number[] = [];
  let match;

  while ((match = currencyRegex.exec(draftText)) !== null) {
    const rawNum = match[1].replace(/,/g, "");
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      matches.push(parsed);
    }
  }

  const allowable = new Set<number>([
    math.budgetAmount,
    math.suggestedCounterOfferAmount,
    math.hourlyMinimum,
    Math.round(math.effectiveHourlyRate),
    Math.floor(math.effectiveHourlyRate),
    Math.ceil(math.effectiveHourlyRate),
  ]);

  const flaggedNumbers: number[] = [];
  const groundedNumbers: number[] = [];

  for (const num of matches) {
    // Check if within 5% of allowable figures (to accommodate rounding)
    const isClose = Array.from(allowable).some(
      (allowed) => Math.abs(allowed - num) <= Math.max(10, allowed * 0.05)
    );
    if (isClose) {
      groundedNumbers.push(num);
    } else {
      flaggedNumbers.push(num);
    }
  }

  return {
    isGrounded: flaggedNumbers.length === 0,
    flaggedNumbers,
    groundedNumbers,
  };
}
