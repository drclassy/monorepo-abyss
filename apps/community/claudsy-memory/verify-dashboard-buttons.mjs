// Architected and built by Claudesy.

import { spawn } from "child_process";
import net from "net";
import { chromium } from "playwright";

const useExternalServer = Boolean(process.env.DASHBOARD_URL);
const tempAgent = `ui-check-${Date.now()}`;
let managedServer = null;
let managedServerLogs = "";

function appendManagedServerLogs(chunk) {
  managedServerLogs += chunk.toString();
  if (managedServerLogs.length > 8000) {
    managedServerLogs = managedServerLogs.slice(-8000);
  }
}

function ok(message, extra) {
  return { ok: true, message, extra: extra ?? null };
}

function fail(message, extra) {
  return { ok: false, message, extra: extra ?? null };
}

async function expectTruthy(label, value, extra) {
  if (!value) {
    throw new Error(`${label} failed${extra ? `: ${extra}` : ""}`);
  }
}

async function expectText(locator, expected, label) {
  const text = await locator.textContent();
  if (text?.trim() !== expected) {
    throw new Error(`${label} failed: expected "${expected}" but got "${text?.trim() ?? ""}"`);
  }
}

async function expectIncludes(locator, expected, label) {
  const text = (await locator.textContent()) ?? "";
  if (!text.includes(expected)) {
    throw new Error(`${label} failed: expected text to include "${expected}" but got "${text}"`);
  }
}

async function runCheck(name, fn, results) {
  try {
    const extra = await fn();
    results.push(ok(name, extra));
  } catch (error) {
    results.push(fail(name, error instanceof Error ? error.message : String(error)));
  }
}

async function runNpmCommand(args, label) {
  await new Promise((resolve, reject) => {
    const child = process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", `npm ${args.join(" ")}`], {
          cwd: process.cwd(),
          env: { ...process.env, NODE_ENV: "production" },
          stdio: "inherit",
          shell: false,
        })
      : spawn("npm", args, {
          cwd: process.cwd(),
          env: { ...process.env, NODE_ENV: "production" },
          stdio: "inherit",
          shell: false,
        });

    child.on("error", (error) => {
      reject(new Error(`${label} failed to start: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} failed with exit code ${code ?? 1}`));
    });
  });
}

function startManagedServer(port) {
  const args = ["run", "start", "--", "--port", String(port)];

  return process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", `npm ${args.join(" ")}`], {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: "production" },
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
      })
    : spawn("npm", args, {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });
}

async function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Could not allocate a free port")));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
    server.on("error", reject);
  });
}

async function waitForServerReady(baseURL) {
  for (let index = 0; index < 60; index += 1) {
    if (managedServer?.exitCode !== null && managedServer?.exitCode !== undefined) {
      throw new Error(
        `Managed server exited early with code ${managedServer.exitCode}\n${managedServerLogs}`,
      );
    }

    try {
      const response = await fetch(baseURL, { redirect: "manual" });
      if (response.ok || response.status === 307 || response.status === 308) {
        return;
      }
    } catch {
      // keep polling until the server is ready
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Server at ${baseURL} was not ready in time\n${managedServerLogs}`);
}

async function stopManagedServer() {
  if (!managedServer || managedServer.exitCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    managedServer.once("close", () => resolve());

    if (process.platform === "win32") {
      const killer = spawn("taskkill", ["/PID", String(managedServer.pid), "/T", "/F"], {
        stdio: "ignore",
        shell: false,
      });
      killer.once("close", () => resolve());
      killer.once("error", () => resolve());
      return;
    }

    try {
      managedServer.kill("SIGTERM");
    } catch {
      resolve();
    }
  });
}

async function ensureBaseURL() {
  if (useExternalServer) {
    return process.env.DASHBOARD_URL;
  }

  await runNpmCommand(["run", "build"], "Production build");

  const port = await findFreePort();
  const baseURL = `http://127.0.0.1:${port}`;

  managedServer = startManagedServer(port);

  managedServer.stdout.on("data", appendManagedServerLogs);
  managedServer.stderr.on("data", appendManagedServerLogs);

  await waitForServerReady(baseURL);
  return baseURL;
}

async function waitForDaemonRunning(expected) {
  for (let index = 0; index < 20; index += 1) {
    const response = await fetch(`${baseURL}/api/daemon`);
    const payload = await response.json();
    if (Boolean(payload?.daemon?.running) === expected) {
      return payload.daemon;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`daemon did not reach running=${expected}`);
}

const manifest = [
  { area: "TopBar", control: "↻", selector: ".top-bar-sync-btn", expected: "Reload engine state and append activity" },
  { area: "ZoneNav", control: "Overview", selector: "[role='button'][aria-current='page'], .menu-vertical-item", expected: "Switch zone content to overview" },
  { area: "ZoneNav", control: "Memory", selector: "[role='button']", expected: "Switch zone content to memory browser" },
  { area: "ZoneNav", control: "Curation", selector: "[role='button']", expected: "Switch zone content to curation" },
  { area: "Overview Hero", control: "Health Check", selector: ".zone-hero-actions .cmd-btn.accent", expected: "Run health command and open detail panel" },
  { area: "Overview Hero", control: "Full Run", selector: ".zone-hero-actions .cmd-btn", expected: "Run full command and open detail panel" },
  { area: "Overview Hero", control: "Command Palette", selector: ".zone-hero-actions .cmd-btn", expected: "Open command palette overlay" },
  { area: "Activity Feed", control: "All/Memory/Skill/Health", selector: ".activity-feed-tab", expected: "Switch active activity filter tab" },
  { area: "Agent Operations", control: "+", selector: "button", expected: "Add a new agent to the roster" },
  { area: "Agent Operations", control: "Start Agent", selector: ".start-agent-btn", expected: "Run boot command and open detail panel" },
  { area: "Daemon Control", control: "Start", selector: "button", expected: "Start daemon and enable stop" },
  { area: "Daemon Control", control: "Stop", selector: "button", expected: "Stop daemon and return to idle" },
  { area: "Documents", control: "SOUL/MEMORY/SKILLS", selector: ".docs-picker-card", expected: "Open document editor for selected doc" },
  { area: "Documents", control: "Close", selector: ".cmd-btn", expected: "Return from editor to picker" },
  { area: "Memory", control: "+ New Fact", selector: ".zone-hero .cmd-btn.accent", expected: "Open new fact detail panel" },
  { area: "Memory", control: "Search", selector: "button[type='submit']", expected: "Submit search and update results subtitle" },
  { area: "Memory", control: "Recent", selector: "button[type='button']", expected: "Load recent facts and show recent mode" },
  { area: "Search Results", control: "Prev/Next", selector: ".workspace-panel button", expected: "Stay disabled when pagination is unavailable" },
  { area: "Detail Panel", control: "Cancel", selector: ".detail-new-fact .cmd-btn", expected: "Close new fact panel without saving" },
  { area: "Curation", control: "Panel actions", selector: ".curation-panel .cmd-btn", expected: "Remain disabled scaffolding controls" },
];

const baseURL = await ensureBaseURL();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

try {
  await fetch(`${baseURL}/api/daemon`, { method: "DELETE" }).catch(() => null);
  await waitForDaemonRunning(false).catch(() => null);
  await page.goto(baseURL, { waitUntil: "networkidle" });

  await runCheck("TopBar sync button", async () => {
    const response = await Promise.all([
      page.waitForResponse(
        (candidate) =>
          candidate.url().includes("/api/state?agent=") &&
          candidate.request().method() === "GET" &&
          candidate.status() === 200,
      ),
      page.locator(".top-bar-sync-btn").click(),
    ]);
    const texts = await page.locator(".activity-event-msg").allTextContents();
    await expectTruthy("sync activity text", texts.some((text) => text.includes("Engine state loaded")));
    return { status: response[0].status() };
  }, results);

  await runCheck("Overview hero health button", async () => {
    await page.getByRole("button", { name: "Health Check", exact: true }).first().click();
    await page.waitForTimeout(1200);
    await expectTruthy("detail panel open", (await page.locator(".detail-panel.open").count()) === 1);
    await expectText(page.locator(".detail-panel-title"), "Command Output", "detail title");
    await expectText(page.locator(".detail-command-name"), "health", "health command");
    return { command: await page.locator(".detail-command-name").textContent() };
  }, results);

  await runCheck("Overview hero full run button", async () => {
    await page.getByRole("button", { name: "Full Run", exact: true }).first().click();
    await page.waitForTimeout(1500);
    await expectText(page.locator(".detail-command-name"), "run", "full run command");
    return { command: await page.locator(".detail-command-name").textContent() };
  }, results);

  await runCheck("Overview command palette open and close", async () => {
    await page.getByRole("button", { name: "▶ Command Palette" }).click();
    await expectTruthy("palette visible", await page.locator(".palette-input").isVisible());
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await expectTruthy("palette hidden", (await page.locator(".palette-input").count()) === 0);
    return { opened: true, closed: true };
  }, results);

  await runCheck("Activity feed tabs", async () => {
    for (const name of ["Memory", "Skill", "Health", "All"]) {
      await page.getByRole("button", { name, exact: true }).click();
      await page.waitForTimeout(120);
      const active = await page.locator(".activity-feed-tab.active").textContent();
      if (active?.trim() !== name) {
        throw new Error(`expected active tab "${name}" but got "${active?.trim() ?? ""}"`);
      }
    }
    return { active: await page.locator(".activity-feed-tab.active").textContent() };
  }, results);

  await runCheck("Add and remove agent buttons", async () => {
    await page.locator('input[placeholder="new-agent-name"]').fill(tempAgent);
    await page.getByRole("button", { name: "+", exact: true }).click();
    await page.waitForTimeout(800);
    await expectTruthy("agent added", await page.getByText(tempAgent, { exact: true }).count());
    await page.locator(".agent-list-item", { hasText: tempAgent }).getByRole("button", { name: "×", exact: true }).click();
    await page.waitForTimeout(600);
    await expectTruthy("agent removed", (await page.getByText(tempAgent, { exact: true }).count()) === 0);
    return { tempAgent };
  }, results);

  await runCheck("Start Agent button", async () => {
    await page.getByRole("button", { name: "Start Agent", exact: true }).click();
    await page.waitForTimeout(1200);
    await expectText(page.locator(".detail-command-name"), "boot", "start agent boot command");
    return { command: await page.locator(".detail-command-name").textContent() };
  }, results);

  await runCheck("Daemon start and stop buttons", async () => {
    await fetch(`${baseURL}/api/daemon`, { method: "DELETE" }).catch(() => null);
    await waitForDaemonRunning(false);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await waitForDaemonRunning(true);
    await page.waitForFunction(
      () => {
        const stop = [...document.querySelectorAll("button")].find((button) => button.textContent?.trim() === "Stop");
        return Boolean(stop && !stop.disabled);
      },
      { timeout: 5000 },
    );
    await expectTruthy("stop enabled after start", await page.getByRole("button", { name: "Stop", exact: true }).isEnabled());
    await page.getByRole("button", { name: "Stop", exact: true }).click();
    await waitForDaemonRunning(false);
    await page.waitForFunction(
      () => {
        const start = [...document.querySelectorAll("button")].find((button) => button.textContent?.trim() === "Start");
        return Boolean(start && !start.disabled);
      },
      { timeout: 5000 },
    );
    await expectTruthy("start enabled after stop", await page.getByRole("button", { name: "Start", exact: true }).isEnabled());
    return {
      daemonText: await page.locator(".workspace-panel-sub").nth(1).textContent().catch(() => null),
    };
  }, results);

  await runCheck("Document picker buttons and close button", async () => {
    for (const doc of ["SOUL", "MEMORY", "SKILLS"]) {
      await page.getByRole("button", { name: new RegExp(doc) }).click();
      await page.waitForTimeout(300);
      await expectIncludes(page.locator(".docs-editor-header .zone-card-title"), `${doc}.md`, `${doc} opened`);
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await page.waitForTimeout(250);
      await expectTruthy(`${doc} picker restored`, await page.getByRole("button", { name: new RegExp(doc) }).count());
    }
    return { docsOpened: 3 };
  }, results);

  await runCheck("Zone nav memory button", async () => {
    await page.getByRole("button", { name: "Memory Facts", exact: true }).click();
    await page.waitForTimeout(250);
    await expectText(page.locator("h1"), "Memory Browser", "memory heading");
    return { heading: await page.locator("h1").textContent() };
  }, results);

  await runCheck("Memory new fact and cancel buttons", async () => {
    await page.getByRole("button", { name: "+ New Fact", exact: true }).click();
    await page.waitForTimeout(300);
    await expectText(page.locator(".detail-panel-title"), "New Fact", "new fact title");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.waitForTimeout(250);
    await expectTruthy("new fact panel closed", (await page.locator(".detail-panel.open").count()) === 0);
    return { panelClosed: true };
  }, results);

  await runCheck("Memory search button", async () => {
    await page.locator('input[placeholder="Search facts..."]').fill("test");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.waitForTimeout(800);
    const subtitle = (await page.locator(".workspace-panel-sub").allTextContents()).find((text) => text.includes("test")) ?? null;
    await expectTruthy("search subtitle updated", Boolean(subtitle?.includes('for "test"') || subtitle?.includes('No results for "test"')));
    return { subtitle };
  }, results);

  await runCheck("Memory recent button", async () => {
    await page.getByRole("button", { name: "Recent", exact: true }).click();
    await page.waitForTimeout(800);
    await expectIncludes(page.locator(".status-chip-value").first(), "recent", "recent mode chip");
    return { mode: await page.locator(".status-chip-value").first().textContent() };
  }, results);

  await runCheck("Search pagination buttons", async () => {
    await expectTruthy("prev disabled", await page.getByRole("button", { name: "Prev", exact: true }).isDisabled());
    await expectTruthy("next disabled", await page.getByRole("button", { name: "Next", exact: true }).isDisabled());
    return { prevDisabled: true, nextDisabled: true };
  }, results);

  await runCheck("Zone nav curation button", async () => {
    await page.getByRole("button", { name: "Curation Curate", exact: true }).click();
    await page.waitForTimeout(250);
    await expectText(page.locator("h1"), "Curation & Governance", "curation heading");
    return { heading: await page.locator("h1").textContent() };
  }, results);

  await runCheck("Curation scaffold buttons remain disabled", async () => {
    const disabled = await page.locator(".curation-panel .cmd-btn:disabled").count();
    if (disabled !== 3) {
      throw new Error(`expected 3 disabled scaffold buttons but got ${disabled}`);
    }
    return { disabled };
  }, results);

  await runCheck("Zone nav overview button", async () => {
    await page.getByRole("button", { name: "Overview Health", exact: true }).click();
    await page.waitForTimeout(250);
    await expectIncludes(page.locator("h1"), "claude-code", "overview heading");
    return { heading: await page.locator("h1").textContent() };
  }, results);
} finally {
  await browser.close();
  await stopManagedServer();
}

console.log(JSON.stringify({ baseURL, manifest, results }, null, 2));

const failed = results.filter((result) => !result.ok);
if (failed.length > 0) {
  process.exitCode = 1;
  throw new Error(
    `Dashboard verification failed: ${failed.map((result) => result.message).join(", ")}`,
  );
}
