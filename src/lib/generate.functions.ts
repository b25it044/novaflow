import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const detailsSchema = z.object({
  name: z.string().max(200), industry: z.string().max(200), audience: z.string().max(500),
  offerings: z.string().max(2000), special: z.string().max(1000),
  voice: z.enum(["Professional", "Friendly", "Playful", "Luxury", "Minimal"]), goal: z.string().max(500),
});
const sectionKey = z.enum(["home", "about", "services", "faqs", "seo"]);

const obj = (props: string[]) => ({
  type: "object", additionalProperties: false, required: props,
  properties: Object.fromEntries(props.map((p) => [p, { type: "string" }])),
});
const SECTION_SCHEMAS: Record<string, object> = {
  home: obj(["headline", "subheadline", "intro", "cta"]),
  about: obj(["story", "mission", "differentiators"]),
  services: obj(["items"]),
  faqs: obj(["items"]),
  seo: obj(["title", "description", "keywords", "slug"]),
};

const SYSTEM = `You are an expert website copywriter for small businesses. Write copy using ONLY the facts provided.
Rules:
- Never invent company history, founding dates, years of experience, team size, prices, discounts, guarantees, warranties, awards, certifications, customer reviews, testimonials, statistics, locations, or business policies (refunds, delivery times, hours).
- When useful information is missing, insert a clear bracketed placeholder such as [Founding year], [Price], [Business hours], [Phone number], [City].
- Match the requested brand voice. Make content specific to the business name, industry, audience, offerings, unique selling point and goal.
Field formats:
- home: headline (max ~10 words), subheadline (1 sentence), intro (2-3 sentences), cta (2-5 words).
- about: story (a short paragraph using placeholders for any history), mission (1-2 sentences), differentiators (3-4 lines each starting with "• ").
- services.items: for each offering, a block: line 1 the service name, then "What it is: ...", then "Benefit: ..."; blocks separated by a blank line.
- faqs.items: 5-6 Q&As formatted "Q: ...\\nA: ..." separated by blank lines; answers with unknown policies/prices must use placeholders.
- seo: title (max 60 chars), description (max 158 chars), keywords (8-12 comma separated, lowercase), slug (starts with "/", lowercase, hyphens).`;

async function callAI(schema: object, userPrompt: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured: the LOVABLE_API_KEY secret is missing.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra", stream: true, store: false,
      reasoning: { effort: "low" },
      instructions: SYSTEM,
      input: [{ role: "user", content: userPrompt }],
      text: { format: { type: "json_schema", name: "website_copy", strict: true, schema } },
    }),
  });
  if (!res.ok || !res.body) {
    let msg = "";
    try { const j = await res.json(); msg = j?.error?.message || j?.message || ""; } catch { /* ignore */ }
    if (res.status === 429) throw new Error("The AI service is busy right now. Please wait a moment and try again.");
    if (res.status === 402) throw new Error(msg || "AI credits have run out. Add credits to your workspace to keep generating.");
    if (res.status === 401) throw new Error("AI is not configured correctly (invalid API key).");
    throw new Error(msg || `AI request failed (status ${res.status}).`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", text = "", done = false;
  while (!done) {
    const { value, done: d } = await reader.read();
    if (d) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, i); buf = buf.slice(i + 2);
      const data = frame.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
      if (!data || data === "[DONE]") continue;
      let ev: any; try { ev = JSON.parse(data); } catch { continue; }
      if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
      else if (ev.type === "response.refusal.delta" || ev.type === "response.refusal.done") throw new Error("The AI declined to write this content. Please review your details.");
      else if (ev.type === "response.failed" || ev.type === "error") throw new Error(ev.response?.error?.message || ev.message || "AI generation failed.");
      else if (ev.type === "response.completed") done = true;
    }
  }
  if (!text) throw new Error("The AI returned no content. Please try again.");
  try { return JSON.parse(text); } catch { throw new Error("The AI returned an unreadable response. Please try again."); }
}

const describe = (d: z.infer<typeof detailsSchema>) => `Business details:
- Business name: ${d.name || "[Business name]"}
- Industry: ${d.industry || "(not provided)"}
- Target audience: ${d.audience || "(not provided)"}
- Products/services: ${d.offerings || "(not provided)"}
- What makes it special: ${d.special || "(not provided)"}
- Brand voice: ${d.voice}
- Main goal: ${d.goal || "(not provided)"}`;

export const generateCopy = createServerFn({ method: "POST" })
  .validator((input) => z.object({ details: detailsSchema }).parse(input))
  .handler(async ({ data }) => {
    const schema = {
      type: "object", additionalProperties: false, required: Object.keys(SECTION_SCHEMAS),
      properties: SECTION_SCHEMAS,
    };
    try {
      return { ok: true as const, copy: await callAI(schema, `${describe(data.details)}\n\nWrite all five website sections.`) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "AI generation failed." };
    }
  });

export const generateSectionCopy = createServerFn({ method: "POST" })
  .validator((input) => z.object({ details: detailsSchema, section: sectionKey }).parse(input))
  .handler(async ({ data }) => {
    try {
      return { ok: true as const, section: await callAI(SECTION_SCHEMAS[data.section]!, `${describe(data.details)}\n\nWrite a fresh, different version of only the "${data.section}" section.`) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "AI generation failed." };
    }
  });
