import contactConfig from "@/config/contact";

const { formId, endpointBase } = contactConfig;

/**
 * Submits a contact form via the Devlune ingest API.
 *
 * Flow (all client-side, no backend required):
 *   1. Mint a short-lived HMAC token from /embed/token  (5-min TTL, single-use)
 *   2. POST to /ingest/form with { form, token, payload }
 *
 * The `fields` object should include all form values including the `_gotcha`
 * honeypot key (Devlune's embed names it this; we honour the same convention).
 *
 * Field keys must match the slugs Devlune assigns in the dashboard
 * (typically the lowercased label, e.g. "Name" → "name").
 */
export async function submitDevluneForm(fields: Record<string, string>): Promise<void> {
  // Step 1 — mint token
  const tokenRes = await fetch(`${endpointBase}/embed/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form: formId }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Token request failed (${tokenRes.status})`);
  }
  const { token } = (await tokenRes.json()) as { token: string };

  // Step 2 — submit
  const submitRes = await fetch(`${endpointBase}/ingest/form`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form: formId, token, payload: fields }),
  });
  if (!submitRes.ok) {
    const body = await submitRes.text().catch(() => "");
    throw new Error(`Form submission failed (${submitRes.status}): ${body}`);
  }
}
