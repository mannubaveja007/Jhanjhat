/**
 * Deterministic, unit-tested redactor.
 * Replaces sensitive identifiers with typed placeholders before text leaves the machine:
 * [EMAIL], [PHONE], [UPI_ID], [PAN], [GSTIN], [AADHAAR], [ACCOUNT_NUMBER]
 */

export interface RedactionResult {
  redactedText: string;
  replacementsCount: Record<string, number>;
  hasRedactions: boolean;
}

export function redactSensitiveInfo(text: string): RedactionResult {
  if (!text) {
    return {
      redactedText: text,
      replacementsCount: {},
      hasRedactions: false,
    };
  }

  let result = text;
  const counts: Record<string, number> = {
    EMAIL: 0,
    PHONE: 0,
    UPI_ID: 0,
    PAN: 0,
    GSTIN: 0,
    AADHAAR: 0,
    ACCOUNT_NUMBER: 0,
  };

  // 1. GSTIN (15 chars: 2 digits state code + 10 chars PAN + 1 entity num + 'Z' + 1 check char)
  // Must run before PAN because GSTIN contains PAN as a substring!
  const gstinRegex = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g;
  result = result.replace(gstinRegex, () => {
    counts.GSTIN++;
    return "[GSTIN]";
  });

  // 2. PAN (10 chars: 5 letters + 4 digits + 1 letter)
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  result = result.replace(panRegex, () => {
    counts.PAN++;
    return "[PAN]";
  });

  // 3. UPI IDs (handles like @okhdfcbank, @okaxis, @ybl, @paytm, @upi, @axl, @ibl, @barodampay, or general upi format)
  // Check known UPI handles or explicit upi handle formats before generic email
  const upiRegex = /\b[a-zA-Z0-9._-]{2,64}@(okhdfcbank|okaxis|okicici|oksbi|paytm|ybl|axl|ibl|barodampay|upi|apl)\b/gi;
  result = result.replace(upiRegex, () => {
    counts.UPI_ID++;
    return "[UPI_ID]";
  });

  // 4. Standard Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  result = result.replace(emailRegex, () => {
    counts.EMAIL++;
    return "[EMAIL]";
  });

  // 5. Aadhaar Numbers (12 digits, spaced or continuous: 1234 5678 9012 or 1234-5678-9012)
  const aadhaarRegex = /\b[2-9]{1}[0-9]{3}[\s-][0-9]{4}[\s-][0-9]{4}\b/g;
  result = result.replace(aadhaarRegex, () => {
    counts.AADHAAR++;
    return "[AADHAAR]";
  });

  // 6. Phone Numbers (Indian and international formats: +91 9876543210, 98765 43210, etc.)
  const phoneRegex = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\+\d{1,3}[\s-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g;
  result = result.replace(phoneRegex, (match) => {
    // Avoid redacting placeholder text or short plain numbers
    if (match.startsWith("[") && match.endsWith("]")) return match;
    counts.PHONE++;
    return "[PHONE]";
  });

  // 7. Bank Account Numbers (9 to 18 contiguous digits, not matching Aadhaar or timestamps)
  const bankAccountRegex = /\b\d{9,18}\b/g;
  result = result.replace(bankAccountRegex, (match) => {
    // Avoid redacting already redacted placeholders or small numbers
    counts.ACCOUNT_NUMBER++;
    return "[ACCOUNT_NUMBER]";
  });

  const totalReplacements = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    redactedText: result,
    replacementsCount: counts,
    hasRedactions: totalReplacements > 0,
  };
}
