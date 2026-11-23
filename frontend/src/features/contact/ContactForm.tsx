import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { Link } from "react-router";
import { buttonClasses } from "@/components/ui/button-styles";
import { trackLead } from "@/features/consent/trackers";
import { fetchFormToken, submitInquiry } from "@/features/contact/api";
import {
  emptyInquiry,
  formFields,
  inquirySchema,
  timelineOptions,
  type InquiryValues,
} from "@/features/contact/schema";
import { cn } from "@/lib/cn";
import type { ServiceDetail } from "@/types/content";

const inputClasses =
  "w-full rounded-sm border border-subtle bg-raised px-3.5 py-2.5 text-fg placeholder:text-muted " +
  "focus:border-focus focus:outline-2 focus:outline-offset-1 focus:outline-focus " +
  "aria-[invalid=true]:border-error";

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: FieldError;
  children: (describedBy: string | undefined) => ReactNode;
}

function Field({ id, label, optional, hint, error, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="font-medium text-fg">
        {label}
        {optional && <span className="ml-1.5 text-sm font-normal text-muted">(optional)</span>}
      </label>
      {children(describedBy)}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error?.message && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-error">
          <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error.message}
        </p>
      )}
    </div>
  );
}

type FormProblem = "expired" | "rate_limited" | "error" | "token" | null;

const problemText: Record<Exclude<FormProblem, null>, string> = {
  expired: "This form had expired, so it has been refreshed. Please press Send again.",
  rate_limited:
    "Too many messages have been sent from your connection. Please try again later, or email me directly.",
  error:
    "Your message could not be sent because of a connection or server problem. Please try again, or email me directly.",
  token:
    "The form could not be prepared. Please check your connection and reload the page, or email me directly.",
};

interface ContactFormProps {
  services: ServiceDetail[];
  initialService?: string;
  fallbackEmail: string | null;
}

export function ContactForm({ services, initialService, fallbackEmail }: ContactFormProps) {
  const uid = useId();
  const fieldId = (name: keyof InquiryValues) => `${uid}-${name}`;
  const tokenRef = useRef<string | null>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const [problem, setProblem] = useState<FormProblem>(null);
  const [sent, setSent] = useState(false);

  const preselected = services.some((s) => s.slug === initialService) ? initialService : "";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { ...emptyInquiry, service: preselected ?? "" },
    mode: "onTouched",
  });

  useEffect(() => {
    let cancelled = false;
    fetchFormToken()
      .then((token) => {
        if (!cancelled) tokenRef.current = token;
      })
      .catch(() => {
        // Retried on submit; only reported if that also fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  useEffect(() => {
    if (problem) problemRef.current?.focus();
  }, [problem]);

  const onSubmit = async (values: InquiryValues) => {
    setProblem(null);
    if (!tokenRef.current) {
      try {
        tokenRef.current = await fetchFormToken();
      } catch {
        setProblem("token");
        return;
      }
    }

    const result = await submitInquiry(values, tokenRef.current);
    switch (result.kind) {
      case "success":
        trackLead();
        setSent(true);
        return;
      case "invalid": {
        let first = true;
        for (const [name, messages] of Object.entries(result.fieldErrors)) {
          if (!formFields.includes(name as keyof InquiryValues)) continue;
          setError(
            name as keyof InquiryValues,
            { type: "server", message: messages[0] },
            { shouldFocus: first },
          );
          first = false;
        }
        if (first) setProblem("error");
        return;
      }
      case "expired":
        tokenRef.current = await fetchFormToken().catch(() => null);
        setProblem(tokenRef.current ? "expired" : "token");
        return;
      default:
        setProblem(result.kind);
    }
  };

  if (sent) {
    return (
      <div role="status" className="rounded-lg border border-success/40 bg-success/10 p-6 sm:p-8">
        <CheckCircle2 size={28} aria-hidden="true" className="text-success" />
        <h2 ref={successRef} tabIndex={-1} className="mt-4 text-h3 focus:outline-none">
          Message received — thank you.
        </h2>
        <p className="mt-2 text-fg-secondary">
          I&rsquo;ll read it and reply by email. No mailing lists, no automated follow-ups.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => handleSubmit(onSubmit)(event)}
      aria-label="Project inquiry"
      className="relative grid gap-6"
    >
      {problem && (
        <div
          ref={problemRef}
          tabIndex={-1}
          role="alert"
          className="flex gap-3 rounded-md border border-error/40 bg-error/10 p-4 text-sm text-fg focus:outline-none"
        >
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-error" />
          <p>
            {problemText[problem]}
            {fallbackEmail && problem !== "expired" && (
              <>
                {" "}
                <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>
              </>
            )}
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={fieldId("name")} label="Name" error={errors.name}>
          {(describedBy) => (
            <input
              id={fieldId("name")}
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy}
              className={cn(inputClasses, "h-12")}
              {...register("name")}
            />
          )}
        </Field>
        <Field id={fieldId("email")} label="Email" error={errors.email}>
          {(describedBy) => (
            <input
              id={fieldId("email")}
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy}
              className={cn(inputClasses, "h-12")}
              {...register("email")}
            />
          )}
        </Field>
        <Field id={fieldId("company")} label="Company" optional error={errors.company}>
          {(describedBy) => (
            <input
              id={fieldId("company")}
              type="text"
              autoComplete="organization"
              aria-invalid={Boolean(errors.company)}
              aria-describedby={describedBy}
              className={cn(inputClasses, "h-12")}
              {...register("company")}
            />
          )}
        </Field>
        <Field
          id={fieldId("whatsapp")}
          label="WhatsApp"
          optional
          hint="Include the country code, e.g. +880."
          error={errors.whatsapp}
        >
          {(describedBy) => (
            <input
              id={fieldId("whatsapp")}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(errors.whatsapp)}
              aria-describedby={describedBy}
              className={cn(inputClasses, "h-12")}
              {...register("whatsapp")}
            />
          )}
        </Field>
      </div>

      <Field id={fieldId("service")} label="Service" optional error={errors.service}>
        {(describedBy) => (
          <select
            id={fieldId("service")}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={describedBy}
            className={cn(inputClasses, "h-12")}
            {...register("service")}
          >
            <option value="">Not sure yet</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field
        id={fieldId("message")}
        label="Project description"
        hint="What you want to build, who it's for, and anything that already exists."
        error={errors.message}
      >
        {(describedBy) => (
          <textarea
            id={fieldId("message")}
            rows={6}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy}
            className={cn(inputClasses, "resize-y")}
            {...register("message")}
          />
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id={fieldId("budget")}
          label="Budget"
          optional
          hint="A range is fine, in any currency."
          error={errors.budget}
        >
          {(describedBy) => (
            <input
              id={fieldId("budget")}
              type="text"
              aria-invalid={Boolean(errors.budget)}
              aria-describedby={describedBy}
              className={cn(inputClasses, "h-12")}
              {...register("budget")}
            />
          )}
        </Field>
        <Field id={fieldId("timeline")} label="Timeline" optional error={errors.timeline}>
          {(describedBy) => (
            <select
              id={fieldId("timeline")}
              aria-invalid={Boolean(errors.timeline)}
              aria-describedby={describedBy}
              className={cn(inputClasses, "h-12")}
              {...register("timeline")}
            >
              {timelineOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {/* Honeypot: off-screen and hidden from assistive technology; people never fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={fieldId("website")}>Leave this field empty</label>
        <input
          id={fieldId("website")}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClasses(
            "primary",
            "cursor-pointer disabled:cursor-wait disabled:opacity-70",
          )}
        >
          {isSubmitting && <Loader2 size={18} aria-hidden="true" className="animate-spin" />}
          {isSubmitting ? "Sending…" : "Send message"}
        </button>
        <p className="text-sm text-muted">
          Your details are used only to reply to you. See the{" "}
          <Link to="/privacy">privacy policy</Link>.
        </p>
      </div>
    </form>
  );
}
