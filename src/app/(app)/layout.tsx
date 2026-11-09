import Link from "next/link";
import { redirect } from "next/navigation";
import { Manrope } from "next/font/google";
import { auth } from "@/auth";
import DarkLogo from "@/components/DarkLogo";
import LogoutButton from "@/components/LogoutButton";
import NavLinks from "@/components/NavLinks";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const who = session.user.name ?? session.user.email;

  return (
    <div className={`${manrope.className} dark-theme relative min-h-screen bg-[#02060f] text-white`}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 20% 0%, rgba(37,99,235,0.45), transparent 70%), radial-gradient(40% 40% at 100% 100%, rgba(14,165,233,0.2), transparent 70%)",
        }}
      />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#02060f]/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
          <Link href="/dashboard" className="mr-2 focus-visible:outline-white">
            <DarkLogo />
          </Link>
          <NavLinks />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-white/60 sm:inline">{who}</span>
            <LogoutButton />
          </div>
        </nav>
      </header>
      <div className="relative">{children}</div>
    </div>
  );
}