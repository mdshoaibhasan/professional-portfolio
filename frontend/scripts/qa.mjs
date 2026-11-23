#!/usr/bin/env node
/**
 * Browser QA for the whole site (Milestone 9). Needs the site running (dev server or `npm run preview`, both
 * with the Django API on :8000) and Chrome or Edge installed. Uses only Node built-ins plus axe-core.
 *
 *   npm run qa                          # every page at 375 px and 1440 px, in Edge
 *   npm run qa -- --browser chrome      # same in Chrome
 *   npm run qa -- --release             # also fail on remaining content placeholders
 *   npm run qa:perf                     # LCP + initial JS budget against the production preview (:4173)
 *
 * Options: --base <url> (default http://localhost:5173), --out <file.json>.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const flag = (name) => args.includes(`--${name}`);

const BROWSERS = {
  edge: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  chrome: "C:/Program Files/Google/Chrome/Application/chrome.exe",
};
const browserName = option("browser", "edge");
const browserPath = process.env.QA_BROWSER_PATH ?? BROWSERS[browserName];
const PERF = flag("perf");
const BASE = option("base", PERF ? "http://localhost:4173" : "http://localhost:5173").replace(
  /\/$/,
  "",
);
const RELEASE = flag("release");
const OUT = option("out", null);
const VIEWPORTS = [
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "1440", width: 1440, height: 900, mobile: false },
];
const BUDGET = { lcpMs: 2500, initialJsGzipBytes: 200 * 1024 };
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const AXE_SOURCE = readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Minimal Chrome DevTools Protocol client ──────────────────────────────────

async function launch() {
  const profile = mkdtempSync(join(tmpdir(), "qa-browser-"));
  const port = 9400 + Math.floor(Math.random() * 400);
  const child = spawn(browserPath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--force-prefers-reduced-motion", // reveal animations would otherwise hide content from axe
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ]);
  let targets;
  for (let i = 0; i < 60 && !targets; i++) {
    await sleep(250);
    targets = await fetch(`http://127.0.0.1:${port}/json`).then(
      (r) => r.json(),
      () => undefined,
    );
  }
  if (!targets) throw new Error(`Could not start ${browserPath}`);
  const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve));
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    } else if (message.method) listeners.forEach((listener) => listener(message));
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, (m) =>
        m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result),
      );
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails)
      throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  };
  const close = () => {
    ws.close();
    child.kill();
    setTimeout(() => rmSync(profile, { recursive: true, force: true }), 1000);
  };
  return { send, evaluate, listeners, close };
}

async function open(browser, url, viewport) {
  await browser.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });
  await browser.send("Page.navigate", { url });
  // Wait until React has rendered the page heading (loaders fetch from the API first).
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    if (
      await browser.evaluate(
        `!!document.querySelector("main h1") && document.readyState === "complete"`,
      )
    )
      break;
  }
  await sleep(400);
}

// ── Page checks ──────────────────────────────────────────────────────────────

const PAGE_CHECKS = `(() => {
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible).map((h) => +h.tagName[1]);
  const skips = levels.filter((level, i) => i > 0 && level > levels[i - 1] + 1).length;
  const unnamed = [...document.querySelectorAll("a[href],button")].filter(
    (el) => visible(el) && !(el.textContent.trim() || el.getAttribute("aria-label") || el.getAttribute("title")),
  );
  return {
    title: document.title,
    titles: document.querySelectorAll("title").length,
    h1: [...document.querySelectorAll("h1")].filter(visible).length,
    headingSkips: skips,
    overflow: document.documentElement.scrollWidth > innerWidth,
    imagesWithoutAlt: document.querySelectorAll("img:not([alt])").length,
    unnamedControls: unnamed.map((el) => el.outerHTML.slice(0, 80)),
    todos: [...document.querySelectorAll("[data-todo-content]")].map((el) => el.textContent.trim()),
  };
})()`;

async function runAxe(browser) {
  if (!(await browser.evaluate("typeof window.axe !== 'undefined'")))
    await browser.evaluate(AXE_SOURCE);
  return browser.evaluate(
    `axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(AXE_TAGS)} } })
       .then((r) => r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help,
         nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) })))`,
  );
}

async function routes() {
  const json = (path) => fetch(`${BASE}/api/v1/${path}`).then((r) => r.json());
  const [projects, services] = await Promise.all([json("projects/"), json("services/")]);
  return [
    "/",
    "/about",
    "/projects",
    ...projects.map((p) => `/projects/${p.slug}`),
    "/services",
    ...services.map((s) => `/services/${s.slug}`),
    "/experience",
    "/contact",
    "/privacy",
    NOT_FOUND_PATH,
  ];
}

const NOT_FOUND_PATH = "/qa-this-page-does-not-exist";

async function auditPages(browser) {
  const consoleErrors = [];
  let currentUrl = "";
  let expect404 = false;
  browser.listeners.add((m) => {
    if (m.method === "Runtime.exceptionThrown") consoleErrors.push(m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
      consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
    // Browser-level errors, e.g. Content-Security-Policy violations and failed resource loads.
    // The deliberate not-found page answers with a real 404 status, which the browser logs; that one is expected.
    const ownStatus404 =
      m.params?.entry?.url === currentUrl && /status of 404/.test(m.params.entry.text);
    if (
      m.method === "Log.entryAdded" &&
      m.params.entry.level === "error" &&
      !(expect404 && ownStatus404)
    )
      consoleErrors.push(m.params.entry.text);
  });
  await browser.send("Runtime.enable");
  await browser.send("Log.enable");
  const results = [];
  for (const path of await routes()) {
    for (const viewport of VIEWPORTS) {
      consoleErrors.length = 0;
      currentUrl = BASE + path;
      expect404 = path === NOT_FOUND_PATH;
      await open(browser, currentUrl, viewport);
      const page = await browser.evaluate(PAGE_CHECKS);
      const axe = await runAxe(browser);
      const failures = [];
      if (page.titles !== 1) failures.push(`${page.titles} <title> elements`);
      if (page.h1 !== 1) failures.push(`${page.h1} visible h1`);
      if (page.headingSkips) failures.push(`${page.headingSkips} skipped heading level(s)`);
      if (page.overflow) failures.push("horizontal overflow");
      if (page.imagesWithoutAlt) failures.push(`${page.imagesWithoutAlt} image(s) without alt`);
      if (page.unnamedControls.length)
        failures.push(`unnamed controls: ${page.unnamedControls.join(" | ")}`);
      if (consoleErrors.length) failures.push(`console errors: ${consoleErrors.join(" | ")}`);
      for (const v of axe)
        failures.push(`axe ${v.impact} ${v.id}: ${v.help} [${v.nodes.join(", ")}]`);
      if (RELEASE && page.todos.length)
        failures.push(`${page.todos.length} content placeholder(s)`);
      results.push({
        path,
        viewport: viewport.name,
        failures,
        todos: page.todos,
        title: page.title,
      });
      console.log(
        `${failures.length ? "FAIL" : "ok  "} ${viewport.name.padStart(4)}  ${path}${failures.map((f) => `\n        - ${f}`).join("")}`,
      );
    }
  }
  return results;
}

async function auditKeyboard(browser) {
  await open(browser, `${BASE}/`, VIEWPORTS[1]);
  const press = (key, code, keyCode) =>
    Promise.all(
      ["keyDown", "keyUp"].map((type) =>
        browser.send("Input.dispatchKeyEvent", { type, key, code, windowsVirtualKeyCode: keyCode }),
      ),
    );
  await press("Tab", "Tab", 9);
  const first = await browser.evaluate(`({
    text: document.activeElement?.textContent.trim(),
    outline: getComputedStyle(document.activeElement).outlineStyle,
    visible: document.activeElement?.getBoundingClientRect().height > 0,
  })`);
  const failures = [];
  if (!/skip/i.test(first.text ?? ""))
    failures.push(`first Tab focuses "${first.text}", expected the skip link`);
  if (first.outline === "none") failures.push("focused skip link has no visible outline");
  if (!first.visible) failures.push("focused skip link is not visible");
  console.log(`${failures.length ? "FAIL" : "ok  "} keyboard: first Tab → "${first.text}"`);
  failures.forEach((f) => console.log(`        - ${f}`));
  return failures;
}

// ── Performance (production build) ──────────────────────────────────────────

async function auditPerformance(browser) {
  // Roughly Lighthouse's mobile profile: slow 4G (150 ms RTT, 1.6 Mbps down) and a 4× slower CPU.
  await browser.send("Network.enable");
  await browser.send("Network.setCacheDisabled", { cacheDisabled: true });
  await browser.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await browser.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const scripts = new Set();
  browser.listeners.add((m) => {
    if (m.method === "Network.responseReceived" && m.params.type === "Script")
      scripts.add(m.params.response.url);
  });
  await open(browser, `${BASE}/`, VIEWPORTS[0]);
  await sleep(2000);
  const lcp = await browser.evaluate(`new Promise((resolve) => {
    new PerformanceObserver((list) => { const e = list.getEntries(); resolve(e[e.length - 1].startTime); })
      .observe({ type: "largest-contentful-paint", buffered: true });
  })`);
  // Budget is defined on gzip size; the preview server sends files uncompressed, so measure gzip here.
  let jsGzip = 0;
  for (const url of scripts)
    jsGzip += gzipSync(Buffer.from(await (await fetch(url)).arrayBuffer())).length;
  const failures = [];
  if (lcp > BUDGET.lcpMs) failures.push(`LCP ${Math.round(lcp)} ms > ${BUDGET.lcpMs} ms`);
  if (jsGzip > BUDGET.initialJsGzipBytes)
    failures.push(
      `initial JS ${(jsGzip / 1024).toFixed(1)} KB gzip > ${BUDGET.initialJsGzipBytes / 1024} KB`,
    );
  console.log(
    `${failures.length ? "FAIL" : "ok  "} home, mobile, slow 4G + 4× CPU: LCP ${Math.round(lcp)} ms (budget ${BUDGET.lcpMs}), ` +
      `initial JS ${(jsGzip / 1024).toFixed(1)} KB gzip in ${scripts.size} files (budget ${BUDGET.initialJsGzipBytes / 1024} KB)`,
  );
  failures.forEach((f) => console.log(`        - ${f}`));
  return { lcpMs: Math.round(lcp), initialJsGzipBytes: jsGzip, scripts: scripts.size, failures };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const browser = await launch();
const version = (await browser.send("Browser.getVersion")).product;
console.log(`QA against ${BASE} in ${version}${RELEASE ? " (release mode)" : ""}\n`);
let report;
let failed;
try {
  if (PERF) {
    report = { performance: await auditPerformance(browser) };
    failed = report.performance.failures.length > 0;
  } else {
    const pages = await auditPages(browser);
    const keyboard = await auditKeyboard(browser);
    const todos = [...new Set(pages.flatMap((p) => p.todos.map((t) => `${p.path}: ${t}`)))];
    report = { browser: version, pages, keyboard, todos };
    const pageFailures = pages.filter((p) => p.failures.length).length;
    failed = pageFailures > 0 || keyboard.length > 0;
    console.log(
      `\n${pages.length} page views, ${pageFailures} with failures; keyboard ${keyboard.length ? "FAIL" : "ok"}; ` +
        `${todos.length} distinct content placeholder(s)${RELEASE ? "" : " (not failing: run with --release before launch)"}`,
    );
  }
} finally {
  browser.close();
}
if (OUT) writeFileSync(OUT, JSON.stringify(report, null, 2));
process.exit(failed ? 1 : 0);
