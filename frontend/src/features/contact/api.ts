import type { InquiryValues } from "@/features/contact/schema";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export type SubmitResult =
  | { kind: "success" }
  | { kind: "invalid"; fieldErrors: Record<string, string[]> }
  | { kind: "expired" }
  | { kind: "rate_limited" }
  | { kind: "error" };

/** Short-lived signed token proving the form was loaded from this site (see backend services.py). */
export async function fetchFormToken(): Promise<string> {
  const response = await fetch(`${API_BASE}/inquiries/form-token/`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Form token request failed: ${response.status}`);
  const { token } = (await response.json()) as { token: string };
  return token;
}

export async function submitInquiry(
  values: InquiryValues,
  formToken: string,
): Promise<SubmitResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/inquiries/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...values,
        service: values.service || null,
        form_token: formToken,
      }),
    });
  } catch {
    return { kind: "error" };
  }

  if (response.status === 201) return { kind: "success" };
  if (response.status === 429) return { kind: "rate_limited" };
  if (response.status === 400) {
    const body = (await response.json().catch(() => ({}))) as Record<string, string[]>;
    if (body.form_token) return { kind: "expired" };
    return { kind: "invalid", fieldErrors: body };
  }
  return { kind: "error" };
}
