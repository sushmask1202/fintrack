"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="mt-4 rounded bg-black px-4 py-2 text-white">
        Try again
      </button>
    </main>
  );
}