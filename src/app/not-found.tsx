import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm">The page you are looking for does not exist.</p>
      <Link href="/dashboard" className="mt-4 inline-block underline">Go to the dashboard</Link>
    </main>
  );
}