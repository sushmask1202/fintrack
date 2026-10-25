import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <header className="border-b">
        <nav className="mx-auto flex max-w-4xl items-center gap-4 p-4">
          <span className="font-semibold">FinTrack</span>
          <Link href="/dashboard" className="text-sm underline">Dashboard</Link>
          <Link href="/transactions" className="text-sm underline">Transactions</Link>
          <span className="ml-auto text-sm">{session.user.name ?? session.user.email}</span>
          <LogoutButton />
        </nav>
      </header>
      {children}
    </>
  );
}