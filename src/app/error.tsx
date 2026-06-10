"use client";

import { RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page-stack">
      <section className="panel error-panel">
        <span className="eyebrow">elvquant</span>
        <h1>Request failed</h1>
        <p>{error.message}</p>
        <button className="button primary" onClick={reset} type="button">
          <RotateCcw size={17} /> Retry
        </button>
      </section>
    </main>
  );
}
