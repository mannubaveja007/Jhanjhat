import { describe, it, expect } from "vitest";
import { redactSensitiveInfo } from "../redact";

describe("Deterministic Redactor", () => {
  it("redacts email addresses", () => {
    const input = "Contact me at freelancer@example.com or client.lead@agency.co.uk for invoices.";
    const result = redactSensitiveInfo(input);
    expect(result.redactedText).toBe("Contact me at [EMAIL] or [EMAIL] for invoices.");
    expect(result.replacementsCount.EMAIL).toBe(2);
  });

  it("redacts Indian phone numbers", () => {
    const input = "Call me at +91 9876543210 or 9823456789 urgently.";
    const result = redactSensitiveInfo(input);
    expect(result.redactedText).toBe("Call me at [PHONE] or [PHONE] urgently.");
    expect(result.replacementsCount.PHONE).toBe(2);
  });

  it("redacts UPI IDs", () => {
    const input = "Please pay advance to freelancepro@okhdfcbank or founder@paytm.";
    const result = redactSensitiveInfo(input);
    expect(result.redactedText).toBe("Please pay advance to [UPI_ID] or [UPI_ID].");
    expect(result.replacementsCount.UPI_ID).toBe(2);
  });

  it("redacts PAN card numbers", () => {
    const input = "TDS deduction for PAN ABCDE1234F before release.";
    const result = redactSensitiveInfo(input);
    expect(result.redactedText).toBe("TDS deduction for PAN [PAN] before release.");
    expect(result.replacementsCount.PAN).toBe(1);
  });

  it("redacts GSTIN correctly without corrupting PAN", () => {
    const input = "Our corporate GSTIN is 22AAAAA0000A1Z5 for your invoice.";
    const result = redactSensitiveInfo(input);
    expect(result.redactedText).toBe("Our corporate GSTIN is [GSTIN] for your invoice.");
    expect(result.replacementsCount.GSTIN).toBe(1);
    expect(result.replacementsCount.PAN).toBe(0);
  });

  it("redacts spaced Aadhaar numbers", () => {
    const input = "Verify identity with Aadhaar 5432 1098 7654.";
    const result = redactSensitiveInfo(input);
    expect(result.redactedText).toBe("Verify identity with Aadhaar [AADHAAR].");
    expect(result.replacementsCount.AADHAAR).toBe(1);
  });

  it("redacts bank account numbers", () => {
    const input = "Wire $5,000 to Account 50100234567891 IFSC HDFC0000123.";
    const result = redactSensitiveInfo(input);
    expect(result.redactedText).toContain("Account [ACCOUNT_NUMBER]");
    expect(result.replacementsCount.ACCOUNT_NUMBER).toBe(1);
  });

  it("handles mixed sensitive text cleanly", () => {
    const input = "Hi John (john@client.com, 9876543210), send payment to 22AAAAA0000A1Z5 or UPI alex@ybl.";
    const result = redactSensitiveInfo(input);
    expect(result.redactedText).toBe("Hi John ([EMAIL], [PHONE]), send payment to [GSTIN] or UPI [UPI_ID].");
    expect(result.hasRedactions).toBe(true);
  });
});
