// URL Inspection for every URL in the live sitemap: coverage state and last crawl.
// Credentials: the Search Console OAuth .env named by GSC_ENV in ~/.config/seo/env (read-only scope).
//   node scripts/gsc-inspect.mjs            → one line per URL + a count per state
import { readFileSync } from "node:fs";

const parseEnv = (text) =>
  Object.fromEntries(
    text
      .split("\n")
      .filter((line) => line.includes("=") && !line.startsWith("#"))
      .map((line) => {
        const at = line.indexOf("=");

        return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^["']|["']$/g, "")];
      }),
  );

const seo = parseEnv(readFileSync(`${process.env.HOME}/.config/seo/env`, "utf8"));

const env = parseEnv(readFileSync(seo.GSC_ENV, "utf8"));

const token = await (
  await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  })
).json();

const locs = async (url) => [...(await (await fetch(url)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const top = await locs("https://getcolormatch.com/sitemap.xml");

const urls = (await Promise.all(top.map((url) => (url.endsWith(".xml") ? locs(url) : [url])))).flat();

const counts = {};

for (const url of urls) {
  const response = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: "sc-domain:getcolormatch.com" }),
  });

  const status = (await response.json()).inspectionResult?.indexStatusResult ?? {};
  const state = status.coverageState ?? "error";
  counts[state] = (counts[state] ?? 0) + 1;
  console.log(`${url.replace("https://getcolormatch.com", "") || "/"} | ${state} | ${status.lastCrawlTime ?? "-"}`);
}

console.log(JSON.stringify(counts));
