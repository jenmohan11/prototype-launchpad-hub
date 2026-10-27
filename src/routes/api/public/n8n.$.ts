import { createFileRoute } from "@tanstack/react-router";

// Same-origin proxy to the n8n webhooks. The n8n base URL and access key live
// only in server env (N8N_BASE_URL, N8N_ACCESS_KEY) and are never sent to the browser.
// Lives under /api/public/ because the prototype page is public (no login): hosted
// deployments require authentication for other /api/ routes, which blocked these calls.
// The allowlist below is the only exposure; the n8n key is injected server-side.
const ALLOWED: Record<string, "GET" | "POST"> = {
  "launchpad-items": "GET",
  "launchpad-state": "GET",
  "launchpad-submit": "POST",
  "launchpad-decision": "POST",
  "feedback-card": "POST",
};

async function forward(request: Request, name: string, method: "GET" | "POST") {
  if (ALLOWED[name] !== method) return Response.json({ error: "unknown endpoint" }, { status: 404 });
  const base = (process.env["N8N_BASE_URL"] || "").replace(/\/+$/, "");
  const key = process.env["N8N_ACCESS_KEY"] || "";
  if (!base || !key) return Response.json({ error: "n8n is not configured on the server" }, { status: 503 });

  const inUrl = new URL(request.url);
  const out = new URL(`${base}/${name}`);
  let body: string | undefined;
  const isJson = (request.headers.get("content-type") || "").includes("application/json");
  if (method === "POST" && isJson) {
    // JSON webhooks: body passes through unchanged; key goes in the query string.
    const raw = await request.text();
    if (raw.length > 50000) return Response.json({ error: "body too large" }, { status: 413 });
    body = raw;
    out.searchParams.set("key", key);
  } else if (method === "GET") {
    const pk = inUrl.searchParams.get("project_key");
    if (pk) out.searchParams.set("project_key", pk.slice(0, 64));
    out.searchParams.set("key", key);
  } else {
    const form = new URLSearchParams(await request.text());
    form.set("key", key);
    body = form.toString();
  }
  try {
    const r = await fetch(out.toString(), {
      method,
      body: body ?? null,
      headers: method === "POST" ? { "content-type": isJson ? "application/json" : "application/x-www-form-urlencoded" } : {},
      signal: AbortSignal.timeout(12000),
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "content-type": r.headers.get("content-type") || "application/json", "cache-control": "no-store" },
    });
  } catch {
    return Response.json({ error: "could not reach n8n" }, { status: 502 });
  }
}

export const Route = createFileRoute("/api/public/n8n/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => forward(request, params._splat || "", "GET"),
      POST: ({ request, params }) => forward(request, params._splat || "", "POST"),
    },
  },
});
