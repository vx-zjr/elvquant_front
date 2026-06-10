export default function Loading() {
  return (
    <main className="page-stack">
      <section className="hero-panel skeleton-panel">
        <div className="skeleton-line wide" />
        <div className="skeleton-line" />
      </section>
      <section className="panel skeleton-panel">
        <div className="skeleton-grid">
          <div />
          <div />
          <div />
        </div>
      </section>
    </main>
  );
}
