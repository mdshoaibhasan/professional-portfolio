import { describe, expect, it } from "vitest";
import { emptyInquiry, inquirySchema } from "@/features/contact/schema";

const valid = {
  ...emptyInquiry,
  name: "Test Client",
  email: "client@example.com",
  message: "We need a Django API for our shop.",
};

describe("inquirySchema", () => {
  it("accepts a minimal valid inquiry and trims values", () => {
    const result = inquirySchema.parse({
      ...valid,
      name: "  Test Client  ",
      email: " client@example.com ",
    });
    expect(result.name).toBe("Test Client");
    expect(result.email).toBe("client@example.com");
  });

  it.each([
    ["name", "A"],
    ["name", "Eve\nBcc: x@example.com"],
    ["email", "not-an-email"],
    ["email", ""],
    ["message", "too short"],
    ["message", "x".repeat(5001)],
    ["whatsapp", "call me"],
    ["budget", "x".repeat(81)],
  ])("rejects invalid %s: %j", (field, value) => {
    const result = inquirySchema.safeParse({ ...valid, [field]: value });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([field]);
  });

  it("accepts an international WhatsApp number or none", () => {
    expect(inquirySchema.safeParse({ ...valid, whatsapp: "+880 1700 000000" }).success).toBe(true);
    expect(inquirySchema.safeParse({ ...valid, whatsapp: "" }).success).toBe(true);
  });

  it("rejects unknown timeline values", () => {
    expect(inquirySchema.safeParse({ ...valid, timeline: "yesterday" }).success).toBe(false);
  });
});
