import { describe, it, expect } from "vitest";
import { verifyQuoteInSource, filterAndVerifyQuotes, normalizeTextForMatching } from "../quotes";
import { computeDealMath, verifyDraftAmounts } from "../math";

describe("Quote Verifier", () => {
  const source = `
    CLIENT AGREEMENT:
    1. Scope of Work: The Contractor will build a 5-page responsive website.
    2. Compensation: Total fixed fee of $1,500. Payment will be released 30 days after final public launch.
    3. Revisions: Contractor agrees to provide unlimited rounds of revisions until the client is completely satisfied.
    4. Kill Fee: No kill fee or cancellation payment shall be provided.
  `;

  it("normalizes whitespace and matches quotes accurately", () => {
    const quote = "Payment will be released 30 days after   final public launch.";
    const result = verifyQuoteInSource(quote, source);
    expect(result.verified).toBe(true);
  });

  it("normalizes curly quotes to match straight quotes", () => {
    const curlyQuote = "“Contractor agrees to provide unlimited rounds of revisions”";
    const result = verifyQuoteInSource(curlyQuote, source);
    expect(result.verified).toBe(true);
  });

  it("fails hallucinated quotes and counts drops", () => {
    const hallucinated = "Contractor will work for free on weekends and holidays.";
    const result = verifyQuoteInSource(hallucinated, source);
    expect(result.verified).toBe(false);

    const items = [
      { id: 1, quote: "No kill fee or cancellation payment shall be provided." },
      { id: 2, quote: "Contractor will work for free on weekends and holidays." },
    ];
    const filtered = filterAndVerifyQuotes(items, source);
    expect(filtered.validItems.length).toBe(1);
    expect(filtered.droppedCount).toBe(1);
    expect(filtered.droppedItems[0].id).toBe(2);
  });
});

describe("Deterministic Plain TypeScript Deal Math", () => {
  it("computes effective hourly rate and hours correctly", () => {
    const workItems = [
      { hoursLow: 10, hoursLikely: 20, hoursHigh: 30 },
      { hoursLow: 15, hoursLikely: 25, hoursHigh: 40 },
    ];
    const math = computeDealMath({
      workItems,
      budgetAmount: 1500,
      hourlyMinimum: 50,
      hiddenCosts: {
        revisionsHours: 10,
        meetingsHours: 5,
        backAndForthHours: 5,
        taxesPercentage: 10,
        toolsCost: 50,
      },
    });

    // likely hours = 45, hidden hours = 20 -> total effective hours = 65
    expect(math.totalHoursLikely).toBe(45);
    expect(math.hiddenHours).toBe(20);
    expect(math.totalEffectiveHours).toBe(65);
    // 1500 / 65 = 23.08
    expect(math.effectiveHourlyRate).toBe(23.08);
    expect(math.isBelowMinimum).toBe(true);
    expect(math.rateDelta).toBe(-26.92);
    // Fair counter offer: 65 * 50 + 50 = 3300 * 1.10 = 3630
    expect(math.suggestedCounterOfferAmount).toBe(3630);
  });

  it("verifies grounded draft amounts", () => {
    const math = computeDealMath({
      workItems: [{ hoursLow: 10, hoursLikely: 20, hoursHigh: 30 }],
      budgetAmount: 2000,
      hourlyMinimum: 75,
    });

    const draftValid = "Thank you for the offer of $2,000. Based on estimated scope, our rate is $100/hr.";
    const check1 = verifyDraftAmounts(draftValid, math);
    expect(check1.isGrounded).toBe(true);

    const draftHallucinated = "I can do this for $9,999 instead.";
    const check2 = verifyDraftAmounts(draftHallucinated, math);
    expect(check2.isGrounded).toBe(false);
    expect(check2.flaggedNumbers).toContain(9999);
  });
});
