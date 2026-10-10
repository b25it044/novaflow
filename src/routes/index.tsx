import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, SampleBadge } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CopyCraft AI — Website Copy for Small Businesses" },
      { name: "description", content: "Create clear, ready-to-use website copy for your small business in minutes." },
      { property: "og:title", content: "CopyCraft AI — Website Copy for Small Businesses" },
      { property: "og:description", content: "Create clear, ready-to-use website copy in minutes." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Shell>
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold text-primary">CopyCraft AI</p>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">Your Website Words, Written Smarter.</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tell us about your business and get homepage, about, services, FAQ and SEO copy — no copywriting skills needed.
          </p>
          <Link to="/details" className="mt-8 inline-flex rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-elegant transition hover:opacity-90">
            Create My Website Copy
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <div className="mb-4 flex items-center justify-between"><span className="text-xs font-semibold uppercase text-muted-foreground">Example · Home</span><SampleBadge /></div>
          <h3 className="font-display text-xl font-bold">Fresh bread, baked before sunrise.</h3>
          <p className="mt-2 text-sm text-muted-foreground">Hearth & Crumb is your neighborhood bakery for sourdough, pastries and custom cakes — made by hand every morning.</p>
          <span className="mt-4 inline-block rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">Order for pickup →</span>
        </div>
      </section>
    </Shell>
  );
}
