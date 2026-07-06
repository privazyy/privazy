const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");

if (!baseUrl) {
  console.log("E2E smoke skipped: set E2E_BASE_URL to check a deployed or local app.");
  process.exit(0);
}

const routes = (process.env.E2E_ROUTES ?? "/,/blog,/sklep,/koszyk,/checkout")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);

for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  if (response.status < 200 || response.status >= 400) {
    throw new Error(`E2E smoke failed for ${route}: HTTP ${response.status}`);
  }
  console.log(`ok ${route} HTTP ${response.status}`);
}

console.log("E2E smoke passed.");
