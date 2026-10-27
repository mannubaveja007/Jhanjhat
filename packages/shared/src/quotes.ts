/**
 * Quote verification with whitespace and curly-quote normalization.
 * Every clause or work item must carry an exact quote from the source document.
 * Quotes that fail verification are dropped and counted.
 */

export function normalizeTextForMatching(text: string): string {
  if (!text) return "";
  return text
    // Normalize curly quotes and dashes
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    // Replace non-breaking spaces and all whitespace sequences with single space
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export interface QuoteVerificationResult {
  verified: boolean;
  matchIndex: number;
  normalizedQuote: string;
}

export function verifyQuoteInSource(quote: string, sourceText: string): QuoteVerificationResult {
  if (!quote || !quote.trim()) {
    return { verified: false, matchIndex: -1, normalizedQuote: "" };
  }
  if (!sourceText || !sourceText.trim()) {
    return { verified: false, matchIndex: -1, normalizedQuote: normalizeTextForMatching(quote) };
  }

  const normQuote = normalizeTextForMatching(quote);
  const normSource = normalizeTextForMatching(sourceText);

  // Direct substring match
  const idx = normSource.indexOf(normQuote);
  if (idx !== -1) {
    return { verified: true, matchIndex: idx, normalizedQuote: normQuote };
  }

  // Fallback: If quote had leading/trailing punctuation or markdown quotes (e.g. "> ...") stripped
  const strippedQuote = normQuote.replace(/^["'>\s]+|["'>\s]+$/g, "").trim();
  if (strippedQuote.length >= 10) {
    const strippedIdx = normSource.indexOf(strippedQuote);
    if (strippedIdx !== -1) {
      return { verified: true, matchIndex: strippedIdx, normalizedQuote: strippedQuote };
    }
  }

  return { verified: false, matchIndex: -1, normalizedQuote: normQuote };
}

export interface VerifiableItem {
  quote?: string | null;
  [key: string]: any;
}

export interface QuoteFilterResult<T extends VerifiableItem> {
  validItems: T[];
  droppedCount: number;
  droppedItems: T[];
}

export function filterAndVerifyQuotes<T extends VerifiableItem>(
  items: T[],
  sourceText: string
): QuoteFilterResult<T> {
  const validItems: T[] = [];
  const droppedItems: T[] = [];

  for (const item of items) {
    if (!item.quote) {
      droppedItems.push(item);
      continue;
    }

    const { verified } = verifyQuoteInSource(item.quote, sourceText);
    if (verified) {
      validItems.push(item);
    } else {
      droppedItems.push(item);
    }
  }

  return {
    validItems,
    droppedCount: droppedItems.length,
    droppedItems,
  };
}
