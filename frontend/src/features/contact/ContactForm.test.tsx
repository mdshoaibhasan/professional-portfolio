import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/features/contact/ContactForm";
import type { ServiceDetail } from "@/types/content";

const services = [
  { slug: "web-development", title: "Web Development" },
  { slug: "web-application-development", title: "Web Application Development" },
] as ServiceDetail[];

type Reply = { status: number; body?: unknown };

/** Mock fetch: token requests always succeed; POST replies are taken from the queue. */
function mockApi(...postReplies: Reply[]) {
  const posts: Array<Record<string, unknown>> = [];
  let tokenCount = 0;
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith("/inquiries/form-token/")) {
      tokenCount += 1;
      return new Response(JSON.stringify({ token: `token-${tokenCount}` }), { status: 200 });
    }
    posts.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    const reply = postReplies.shift() ?? { status: 201, body: { detail: "ok" } };
    return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { posts, fetchMock };
}

function renderForm(props: Partial<Parameters<typeof ContactForm>[0]> = {}) {
  render(
    <MemoryRouter>
      <ContactForm services={services} fallbackEmail="hello@example.com" {...props} />
    </MemoryRouter>,
  );
  return userEvent.setup();
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Test Client");
  await user.type(screen.getByLabelText("Email"), "client@example.com");
  await user.type(
    screen.getByLabelText("Project description"),
    "We need a Django API for our inventory system.",
  );
}

describe("ContactForm", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows inline errors, focuses the first one, and sends nothing when required fields are empty", async () => {
    const { posts } = mockApi();
    const user = renderForm();
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email address.")).toBeInTheDocument();
    const name = screen.getByLabelText("Name");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Please enter your name.");
    expect(name).toHaveFocus();
    expect(posts).toHaveLength(0);
  });

  it("submits the inquiry with the form token and shows a focused confirmation", async () => {
    const { posts } = mockApi({ status: 201, body: { detail: "ok" } });
    const user = renderForm();
    await fillRequired(user);
    await user.selectOptions(screen.getByLabelText(/Timeline/), "1-3-months");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const heading = await screen.findByRole("heading", { name: /Message received/ });
    expect(heading).toHaveFocus();
    expect(posts).toEqual([
      expect.objectContaining({
        name: "Test Client",
        email: "client@example.com",
        service: null,
        timeline: "1-3-months",
        website: "",
        form_token: "token-1",
      }),
    ]);
  });

  it("preselects a valid service from the URL and ignores unknown ones", () => {
    mockApi();
    renderForm({ initialService: "web-application-development" });
    expect(screen.getByLabelText(/Service/)).toHaveValue("web-application-development");
    cleanup();
    renderForm({ initialService: "bogus" });
    expect(screen.getByLabelText(/Service/)).toHaveValue("");
  });

  it("shows server-side field errors next to the field", async () => {
    mockApi({ status: 400, body: { email: ["Enter a valid email address."] } });
    const user = renderForm();
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("explains rate limiting and offers the email fallback", async () => {
    mockApi({ status: 429 });
    const user = renderForm();
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Too many messages/);
    expect(alert.querySelector('a[href="mailto:hello@example.com"]')).not.toBeNull();
    expect(alert).toHaveFocus();
  });

  it("refreshes an expired token and asks the visitor to send again", async () => {
    const { posts } = mockApi(
      { status: 400, body: { form_token: ["expired"] } },
      { status: 201, body: { detail: "ok" } },
    );
    const user = renderForm();
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/expired/);

    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByRole("heading", { name: /Message received/ });
    expect(posts.map((p) => p.form_token)).toEqual(["token-1", "token-2"]);
  });

  it("reports network failures without losing what was typed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/form-token/")) return new Response(JSON.stringify({ token: "t" }));
        throw new TypeError("Failed to fetch");
      }),
    );
    const user = renderForm();
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not be sent/);
    expect(screen.getByLabelText("Name")).toHaveValue("Test Client");
  });

  it("keeps the honeypot out of the accessibility tree and the tab order", async () => {
    mockApi();
    renderForm();
    await waitFor(() => expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled());
    expect(screen.queryByRole("textbox", { name: /leave this field empty/i })).toBeNull();
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});
