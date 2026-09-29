// Slow re-verification pass for problem entries: retries with backoff.
// Embed must pass (else drop). Icon failure -> clear icon (letter-art fallback).
import { readFileSync, writeFileSync } from "node:fs";

const { verified, problems } = JSON.parse(readFileSync("/tmp/catalog_verified.json", "utf8"));
const HDR = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function checkEmbed(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { redirect: "follow", headers: HDR, signal: AbortSignal.timeout(16000) });
      if (r.status >= 200 && r.status < 300) {
        const xfo = (r.headers.get("x-frame-options") ?? "").toLowerCase();
        const csp = (r.headers.get("content-security-policy") ?? "").toLowerCase();
        if (xfo.includes("deny") || xfo.includes("sameorigin")) return `embed XFO ${xfo}`;
        if (/frame-ancestors\s+'?self'|frame-ancestors\s+'none'/.test(csp)) return "embed CSP";
        return null;
      }
      if (r.status === 403 || r.status === 429) { await sleep(2500 + attempt * 3000); continue; }
      return `embed HTTP ${r.status}`;
    } catch (e: any) {
      if (attempt === 2) return `embed ERR ${String(e).slice(0, 50)}`;
      await sleep(2000);
    }
  }
  return "embed retries exhausted";
}

async function checkIcon(url: string): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(url, { method: "HEAD", redirect: "follow", headers: HDR, signal: AbortSignal.timeout(14000) });
      const ct = r.headers.get("content-type") ?? "";
      if (r.status === 200 && /image|octet/.test(ct)) return true;
      if (r.status === 403 || r.status === 429) { await sleep(2500); continue; }
      const r2 = await fetch(url, { redirect: "follow", headers: HDR, signal: AbortSignal.timeout(14000) });
      const ct2 = r2.headers.get("content-type") ?? "";
      return r2.status === 200 && /image|octet/.test(ct2);
    } catch {
      if (attempt === 1) return false;
      await sleep(2000);
    }
  }
  return false;
}

const kept: any[] = [...verified];
const stillBad: any[] = [];
for (let i = 0; i < problems.length; i++) {
  const p = problems[i];
  const embedErr = await checkEmbed(p.embed);
  if (embedErr) { stillBad.push({ ...p, problem: embedErr }); }
  else {
    if (p.icon) {
      const ok = await checkIcon(p.icon);
      if (!ok) delete p.icon;
    }
    kept.push(p);
  }
  if (i % 10 === 9) console.log(`  ${i + 1}/${problems.length}`);
}
console.log("recovered:", kept.length - verified.length, "still bad:", stillBad.length);
console.log("STILL BAD:", stillBad.map((p: any) => `${p.genre}: ${p.slug} [${p.problem}]`).join("\n"));

const finalCounts: Record<string, number> = {};
for (const v of kept) finalCounts[v.genre] = (finalCounts[v.genre] ?? 0) + 1;
console.log("FINAL per genre:", JSON.stringify(finalCounts, null, 1));

writeFileSync("/tmp/catalog_final.json", JSON.stringify({ verified: kept, stillBad }, null, 1));
console.log("wrote /tmp/catalog_final.json");
