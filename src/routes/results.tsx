import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, SampleBadge } from "@/components/Shell";
import { FIELD_LABELS, SECTION_LABELS, allToText, generateSection, sectionToText, store, type BusinessDetails, type SectionKey, type WebsiteCopy } from "@/lib/copy";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your Website Copy — CopyCraft AI" },
      { name: "description", content: "Review, edit, copy and download your website copy." },
      { property: "og:title", content: "Your Website Copy — CopyCraft AI" },
      { property: "og:description", content: "Review, edit, copy and download your website copy." },
    ],
  }),
  component: Results,
});

const KEYS = Object.keys(SECTION_LABELS) as SectionKey[];
const btn = "rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:border-primary hover:text-primary disabled:opacity-50";

function Results() {
  const [data, setData] = useState<{ d: BusinessDetails; c: WebsiteCopy } | null | undefined>(undefined);
  const [tab, setTab] = useState<SectionKey>("home");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setData(store.load()), []);

  if (data === undefined) return <Shell><p className="text-muted-foreground">Loading…</p></Shell>;
  if (!data) return (
    <Shell>
      <div className="rounded-2xl border border-border p-10 text-center">
        <h1 className="font-display text-2xl font-bold">No copy yet</h1>
        <p className="mt-2 text-muted-foreground">Fill in your business details first.</p>
        <Link to="/details" className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground">Start</Link>
      </div>
    </Shell>
  );

  const update = (c: WebsiteCopy) => { setData({ ...data, c }); store.save(data.d, c); };
  const copy = async (t: string, msg: string) => { await navigator.clipboard.writeText(t); toast.success(msg); };
  const regen = async () => { setBusy(true); try { const s = await generateSection(tab, data.d); update({ ...data.c, [tab]: s }); toast.success(`${SECTION_LABELS[tab]} refreshed`); } catch (e) { toast.error(e instanceof Error ? e.message : "Regeneration failed"); } finally { setBusy(false); } };
  const download = () => {
    const url = URL.createObjectURL(new Blob([allToText(data.c)], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${data.d.name || "website"}-copy.txt` });
    a.click(); URL.revokeObjectURL(url);
  };
  const section = data.c[tab] as Record<string, string>;

  return (
    <Shell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Website copy for {data.d.name}</h1>
          <div className="mt-2"><SampleBadge /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => copy(allToText(data.c), "All content copied")}>Copy all</button>
          <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground" onClick={download}>Download .txt</button>
        </div>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {KEYS.map((k) => (
          <button key={k} onClick={() => { setTab(k); setEditing(false); }}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${tab === k ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {SECTION_LABELS[k]}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="mb-5 flex flex-wrap justify-end gap-2">
          <button className={btn} onClick={() => setEditing(!editing)}>{editing ? "Done editing" : "Edit"}</button>
          <button className={btn} onClick={() => copy(sectionToText(tab, data.c), `${SECTION_LABELS[tab]} copied`)}>Copy section</button>
          <button className={btn} disabled={busy} onClick={regen}>{busy ? "Regenerating…" : "Regenerate"}</button>
        </div>
        <div className="space-y-6">
          {Object.entries(section).map(([f, v]) => (
            <div key={f}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary">{FIELD_LABELS[f]}</p>
              {editing ? (
                <textarea rows={Math.max(2, v.split("\n").length + 1)} value={v}
                  onChange={(e) => update({ ...data.c, [tab]: { ...section, [f]: e.target.value } })}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 focus:border-primary focus:outline-none" />
              ) : (
                <p className={`whitespace-pre-line ${f === "headline" ? "font-display text-2xl font-bold" : "text-foreground/85"}`}>{v}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Link to="/details" className="mt-6 inline-block text-sm text-primary">← Edit business details</Link>
    </Shell>
  );
}
