import { spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const baseUrl = (process.env.RESPONSIVE_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const routes = [
  "/",
  "/admin",
  "/blog",
  "/blog/czy-musisz-powolac-inspektora-ochrony-danych",
  "/sklep/polityka-prywatnosci",
];
const viewports = [
  { name: "mobile-360", width: 360, height: 780 },
  { name: "mobile-390", width: 390, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tv-1080", width: 1920, height: 1080 },
  { name: "tv-4k", width: 2560, height: 1440 },
];

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? "chrome";
}

async function getJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function waitForDebugPort(port) {
  const endpoint = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      await getJson(`${endpoint}/json/version`);
      return endpoint;
    } catch {
      await sleep(200);
    }
  }
  throw new Error("Browser debugging endpoint did not start in time.");
}

function launchBrowser() {
  const port = Number(process.env.RESPONSIVE_CDP_PORT ?? 0) || 9300 + Math.floor(Math.random() * 600);
  const userDataDir = join(tmpdir(), `privazy-responsive-${process.pid}-${Date.now()}`);
  const browser = spawn(findBrowser(), [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ], {
    stdio: "ignore",
    windowsHide: true,
  });

  browser.on("error", (error) => {
    throw error;
  });

  return { browser, port, userDataDir };
}

async function createCdpClient(endpoint) {
  const targets = await getJson(`${endpoint}/json/list`);
  const page = targets.find((target) => target.type === "page");
  if (!page?.webSocketDebuggerUrl) {
    throw new Error("Could not find a browser page target.");
  }

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  const callbacks = new Map();
  const errors = [];
  let nextId = 1;

  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && callbacks.has(message.id)) {
      const { resolve: resolveMessage, reject } = callbacks.get(message.id);
      callbacks.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolveMessage(message.result);
      }
      return;
    }

    if (message.method === "Runtime.consoleAPICalled" && message.params?.type === "error") {
      const text = message.params.args?.map((arg) => arg.value ?? arg.description ?? "").join(" ").trim();
      if (text) errors.push(text);
    }

    if (message.method === "Log.entryAdded" && message.params?.entry?.level === "error") {
      errors.push(message.params.entry.text);
    }
  });

  const send = (method, params = {}) => {
    const id = nextId;
    nextId += 1;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolveMessage, reject) => {
      callbacks.set(id, { resolve: resolveMessage, reject });
    });
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  return {
    errors,
    clearErrors: () => {
      errors.length = 0;
    },
    close: () => socket.close(),
    send,
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Evaluation failed.");
  }

  return result.result.value;
}

async function waitForPage(cdp) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const state = await evaluate(cdp, `({
      ready: document.readyState,
      textLength: document.body?.innerText?.trim().length ?? 0
    })`);
    if (state.ready === "complete" && state.textLength > 80) return;
    await sleep(250);
  }
  throw new Error("Page did not finish rendering useful content in time.");
}

async function checkViewport(cdp, route, viewport) {
  const url = `${baseUrl}${route}`;
  cdp.clearErrors();
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 768,
  });
  await cdp.send("Page.navigate", { url });
  await waitForPage(cdp);
  await sleep(400);

  const result = await evaluate(cdp, `(() => {
    const allowedSelector = '[data-responsive-scroll="true"], .pvz-h-scroll';
    const overlay = Boolean(document.querySelector('[data-nextjs-dialog], [data-nextjs-toast], .vite-error-overlay, #webpack-dev-server-client-overlay'));
    const rootWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const rootOverflow = Math.max(0, rootWidth - window.innerWidth);
    const offenders = Array.from(document.body.querySelectorAll('*'))
      .filter((element) => {
        if (element.closest(allowedSelector)) return false;
        const rect = element.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return false;
        const style = window.getComputedStyle(element);
        if (style.visibility === 'hidden' || style.display === 'none') return false;
        return rect.left < -1 || rect.right > window.innerWidth + 1;
      })
      .slice(0, 8)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const className = typeof element.className === 'string' ? element.className.split(/\\s+/).slice(0, 5).join('.') : '';
        return {
          tag: element.tagName.toLowerCase(),
          className,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      });

    return {
      overlay,
      rootOverflow: Math.round(rootOverflow),
      offenders,
      title: document.title,
      textLength: document.body.innerText.trim().length,
    };
  })()`);

  const failures = [];
  if (result.overlay) failures.push("framework overlay is visible");
  if (result.textLength <= 80) failures.push("page rendered too little text");
  if (result.rootOverflow > 1) failures.push(`root horizontal overflow: ${result.rootOverflow}px`);
  if (result.rootOverflow > 1 && result.offenders.length > 0) {
    failures.push(`offenders: ${JSON.stringify(result.offenders)}`);
  }
  if (cdp.errors.length > 0) failures.push(`console errors: ${cdp.errors.join(" | ")}`);

  if (failures.length > 0) {
    throw new Error(`${route} ${viewport.name} ${viewport.width}x${viewport.height}: ${failures.join("; ")}`);
  }

  console.log(`ok ${route} ${viewport.name} ${viewport.width}x${viewport.height}`);
}

async function assertServer() {
  try {
    await fetch(baseUrl, { redirect: "manual" });
  } catch (error) {
    throw new Error(`Could not reach ${baseUrl}. Start the app first with npm run dev. ${error.message}`);
  }
}

async function main() {
  await assertServer();
  const launch = launchBrowser();
  let cdp;

  try {
    const endpoint = await waitForDebugPort(launch.port);
    cdp = await createCdpClient(endpoint);

    for (const route of routes) {
      for (const viewport of viewports) {
        await checkViewport(cdp, route, viewport);
      }
    }

    console.log("Responsive check passed.");
  } finally {
    cdp?.close();
    launch.browser.kill();
    const tmpRoot = resolve(tmpdir());
    const profilePath = resolve(launch.userDataDir);
    if (profilePath.startsWith(tmpRoot)) {
      try {
        rmSync(profilePath, { recursive: true, force: true });
      } catch {
        // Windows can keep the headless browser profile locked for a moment after process kill.
      }
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
