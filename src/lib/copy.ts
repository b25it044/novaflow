// Content model + sample generator. Replace `generateSection` with a real AI call later.
export type Voice = "Professional" | "Friendly" | "Playful" | "Luxury" | "Minimal";
export interface BusinessDetails {
  name: string; industry: string; audience: string; offerings: string;
  special: string; voice: Voice; goal: string;
}
export type SectionKey = "home" | "about" | "services" | "faqs" | "seo";
export interface WebsiteCopy {
  home: { headline: string; subheadline: string; intro: string; cta: string };
  about: { story: string; mission: string; differentiators: string };
  services: { items: string };
  faqs: { items: string };
  seo: { title: string; description: string; keywords: string; slug: string };
}
export const SECTION_LABELS: Record<SectionKey, string> = {
  home: "Home", about: "About", services: "Services", faqs: "FAQs", seo: "SEO Metadata",
};
export const FIELD_LABELS: Record<string, string> = {
  headline: "Headline", subheadline: "Subheadline", intro: "Introduction", cta: "Call to action",
  story: "Brand story", mission: "Mission", differentiators: "Differentiators",
  items: "Content", title: "Page title", description: "Meta description", keywords: "Suggested keywords", slug: "URL slug",
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const pick = (a: string[]): string => a[Math.floor(Math.random() * a.length)] ?? a[0] ?? "";

export function sampleSection<K extends SectionKey>(k: K, d: BusinessDetails): WebsiteCopy[K] {
  const n = d.name || "Your Business";
  const list = (d.offerings || "Consulting, Support").split(/,|\n/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
  const map: WebsiteCopy = {
    home: {
      headline: pick([`${n}: ${d.industry || "Service"} done right.`, `Meet ${n} — built for ${d.audience || "you"}.`, `Better ${d.industry || "results"} start with ${n}.`]),
      subheadline: `${d.special || "Quality work and real care"}, for ${d.audience || "people like you"}.`,
      intro: `${n} offers ${list.join(", ")}. We help ${d.audience || "our customers"} get results without the hassle, in a ${d.voice.toLowerCase()} way that feels right.`,
      cta: pick(["Get started today", "Book a free consultation", "Talk to us"]),
    },
    about: {
      story: `${n} started with a simple idea: ${d.industry || "this industry"} should work better for ${d.audience || "everyone"}. Today we bring that idea to every project.`,
      mission: `Our mission is to ${d.goal ? d.goal.toLowerCase() : "deliver real value"} while staying honest and approachable.`,
      differentiators: `• ${d.special || "Personal attention"}\n• Clear, upfront communication\n• Results you can measure`,
    },
    services: {
      items: list.map((s) => `${s}\nWhat it is: A tailored ${s.toLowerCase()} service for ${d.audience || "you"}.\nBenefit: Save time and get dependable results.`).join("\n\n"),
    },
    faqs: {
      items: [
        [`What does ${n} do?`, `We provide ${list.join(", ")}.`],
        ["Who do you work with?", `Mostly ${d.audience || "small businesses and individuals"}.`],
        ["What makes you different?", d.special || "Our personal, hands-on approach."],
        ["How do I get started?", "Reach out through our contact page and we'll reply within one business day."],
        ["How much does it cost?", "Pricing depends on your needs — ask us for a free quote."],
      ].map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n"),
    },
    seo: {
      title: `${n} | ${d.industry || "Services"}`,
      description: `${n} offers ${list.join(", ")} for ${d.audience || "you"}. ${d.special || ""}`.trim().slice(0, 158),
      keywords: [d.industry, ...list, d.audience, n].filter(Boolean).map((s) => s!.toLowerCase()).join(", "),
      slug: `/${slugify(n)}`,
    },
  };
  return map[k];
}

// Real AI generation via secure server functions.
export async function generateSection<K extends SectionKey>(k: K, d: BusinessDetails): Promise<WebsiteCopy[K]> {
  const { generateSectionCopy } = await import("./generate.functions");
  const r = await generateSectionCopy({ data: { details: d, section: k } });
  if (!r.ok) throw new Error(r.error);
  return r.section as WebsiteCopy[K];
}
export async function generateAll(d: BusinessDetails): Promise<WebsiteCopy> {
  const { generateCopy } = await import("./generate.functions");
  const r = await generateCopy({ data: { details: d } });
  if (!r.ok) throw new Error(r.error);
  return r.copy as WebsiteCopy;
}
export function sectionToText(k: SectionKey, c: WebsiteCopy) {
  return `== ${SECTION_LABELS[k].toUpperCase()} ==\n` + Object.entries(c[k]).map(([f, v]) => `${FIELD_LABELS[f]}:\n${v}`).join("\n\n");
}
export const allToText = (c: WebsiteCopy) => (Object.keys(SECTION_LABELS) as SectionKey[]).map((k) => sectionToText(k, c)).join("\n\n\n");

const KEY = "copycraft";
export const store = {
  save: (d: BusinessDetails, c: WebsiteCopy) => sessionStorage.setItem(KEY, JSON.stringify({ d, c })),
  load: (): { d: BusinessDetails; c: WebsiteCopy } | null => { try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; } },
};
