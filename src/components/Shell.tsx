import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">C</span>
            CopyCraft <span className="text-primary">AI</span>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>Home</Link>
            <Link to="/details" activeProps={{ className: "text-foreground font-medium" }}>Create</Link>
            <Link to="/results" activeProps={{ className: "text-foreground font-medium" }}>Results</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </div>
  );
}

export const SampleBadge = () => (
  <span className="inline-flex items-center rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
    AI-generated — review before publishing
  </span>
);
