import { OutOfScopeResult } from "@jhanjhat/shared";

export async function checkOutOfScope(params: {
  projectTitle: string;
  scopeSummary: string;
  hourlyMinimum: number;
  newRequestText: string;
}): Promise<OutOfScopeResult> {
  const { projectTitle, scopeSummary, hourlyMinimum, newRequestText } = params;

  // Determine if new request introduces unstated additions
  const outOfScopeIndicators = [
    /mobile app|ios|android/i,
    /stripe connect|split payouts|payment gateway/i,
    /ai recommendation|chatgpt|llm/i,
    /extra (page|screen|revision|feature)/i,
    /redesign|overhaul|different direction/i,
    /devops|docker|kubernetes|aws|hosting config/i,
    /urgent|weekend|asap|24 hours/i,
    /analytics|seo audit|marketing/i,
  ];

  const matched = outOfScopeIndicators.some((pattern) => pattern.test(newRequestText));
  const lines = newRequestText.split("\n").map((l) => l.trim()).filter(Boolean);
  const relevantQuote = lines[0] || newRequestText.slice(0, 120);

  if (matched || newRequestText.length > 50) {
    const estimatedHours = 12;
    const suggestedPrice = Math.round(estimatedHours * hourlyMinimum * 1.15);

    return {
      status: "OUT_OF_SCOPE",
      quote: relevantQuote,
      suggestedPrice,
      replyDraft: `Hi! Thanks for sending this over. The requested feature ("${relevantQuote}") falls outside our originally agreed project scope. I'd love to build it for you as a Change Order for $${suggestedPrice} (+${estimatedHours}h to timeline). Let me know if that works!`,
      reasoning: "The request introduces additional architectural components and unstated features not covered in the original baseline deliverables.",
    };
  }

  return {
    status: "IN_SCOPE",
    quote: relevantQuote,
    suggestedPrice: 0,
    replyDraft: `Hi! Got your note regarding "${relevantQuote}". This is well within our current scope and will be included in the upcoming release.`,
    reasoning: "The request directly aligns with standard deliverable revisions and clarifications.",
  };
}
