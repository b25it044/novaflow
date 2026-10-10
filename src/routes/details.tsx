import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { generateAll, store, type BusinessDetails, type Voice } from "@/lib/copy";

export const Route = createFileRoute("/details")({
  head: () => ({
    meta: [
      { title: "Business Details — CopyCraft AI" },
      { name: "description", content: "Tell CopyCraft AI about your business to create your website copy." },
      { property: "og:title", content: "Business Details — CopyCraft AI" },
      { property: "og:description", content: "Describe your business to create website copy." },
    ],
  }),
  component: Details,
});

const VOICES: Voice[] = ["Professional", "Friendly", "Playful", "Luxury", "Minimal"];
const empty: BusinessDetails = { name: "", industry: "", audience: "", offerings: "", special: "", voice: "Friendly", goal: "" };
const input = "w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}</label>
  );
}

function Details() {
  const nav = useNavigate();
  const [d, setD] = useState<BusinessDetails>(empty);
  useEffect(() => { const s = store.load(); if (s) setD(s.d); }, []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof BusinessDetails) => (e: any) => setD({ ...d, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const c = await generateAll(d);
      store.save(d, c);
      nav({ to: "/results" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold">Tell us about your business</h1>
      <p className="mt-2 text-muted-foreground">A few details help shape copy that sounds like you.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-elegant md:grid-cols-2">
        <F label="1. Business name"><input required className={input} value={d.name} onChange={set("name")} placeholder="Hearth & Crumb" /></F>
        <F label="2. Industry or business type"><input required className={input} value={d.industry} onChange={set("industry")} placeholder="Bakery" /></F>
        <F label="3. Target audience"><input required className={input} value={d.audience} onChange={set("audience")} placeholder="Local families and office workers" /></F>
        <F label="7. Main business goal"><input required className={input} value={d.goal} onChange={set("goal")} placeholder="Increase online pickup orders" /></F>
        <div className="md:col-span-2"><F label="4. Products or services (comma separated)"><textarea required rows={2} className={input} value={d.offerings} onChange={set("offerings")} placeholder="Sourdough, Pastries, Custom cakes" /></F></div>
        <div className="md:col-span-2"><F label="5. What makes the business special"><textarea required rows={2} className={input} value={d.special} onChange={set("special")} placeholder="Everything baked by hand before sunrise" /></F></div>
        <div className="md:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">6. Brand voice</span>
          <div className="flex flex-wrap gap-2">
            {VOICES.map((v) => (
              <button type="button" key={v} onClick={() => setD({ ...d, voice: v })}
                className={`rounded-full border px-4 py-2 text-sm transition ${d.voice === v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{v}</button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60 md:w-auto">
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />}
            {busy ? "Writing your copy… (about 20–60 seconds)" : "Generate Website Copy"}
          </button>
          {error && <p role="alert" className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">Couldn't generate your copy: {error}</p>}
          <p className="mt-2 text-xs text-muted-foreground">Your details are sent securely to an AI model. Review all copy before publishing.</p>
        </div>
      </form>
    </Shell>
  );
}
