import { z } from "zod";

/**
 * Client-side validation for the inquiry form. Limits mirror the server
 * (backend/apps/inquiries/serializers.py); the server remains the authority.
 */

const singleLine = /^[^\r\n]*$/;

export const timelineOptions = [
  { value: "", label: "Not sure yet" },
  { value: "asap", label: "As soon as possible" },
  { value: "1-month", label: "Within a month" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "flexible", label: "Flexible" },
] as const;

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(100, "Please keep your name under 100 characters.")
    .regex(singleLine, "Please keep your name on one line."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .max(254, "That email address is too long.")
    .pipe(z.email("Enter a valid email address, like name@example.com.")),
  company: z.string().trim().max(120, "Please keep this under 120 characters.").regex(singleLine),
  whatsapp: z
    .string()
    .trim()
    .regex(/^(\+?[0-9 ]{6,20})?$/, "Use digits and spaces, with an optional leading +."),
  service: z.string(),
  message: z
    .string()
    .trim()
    .min(20, "Please add a little more detail (at least 20 characters).")
    .max(5000, "Please keep your message under 5,000 characters."),
  budget: z.string().trim().max(80, "Please keep this under 80 characters.").regex(singleLine),
  timeline: z.enum(["", "asap", "1-month", "1-3-months", "flexible"]),
  /** Honeypot: hidden from people, filled in by naive bots. */
  website: z.string(),
});

export type InquiryValues = z.infer<typeof inquirySchema>;

export const emptyInquiry: InquiryValues = {
  name: "",
  email: "",
  company: "",
  whatsapp: "",
  service: "",
  message: "",
  budget: "",
  timeline: "",
  website: "",
};

/** Server-side field names that map onto form fields. */
export const formFields = Object.keys(emptyInquiry) as Array<keyof InquiryValues>;
