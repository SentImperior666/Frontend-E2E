export default function Home() {
  return (
    <main className="min-h-screen bg-parchment-100 text-ink-900 p-12">
      <h1 className="text-3xl font-display">RPG Workshop</h1>
      <p className="mt-4 max-w-prose">
        This is the workshop authoring surface. Real screens live in Storybook (run
        <code className="mx-1 rounded bg-ink-900/10 px-2 py-0.5">pnpm storybook</code>).
        New screens start at the outer loop:
        <code className="mx-1 rounded bg-ink-900/10 px-2 py-0.5">/design-loop</code>.
      </p>
    </main>
  );
}
