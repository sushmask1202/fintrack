import Link from "next/link";
import { Manrope } from "next/font/google";
import DarkLogo from "@/components/DarkLogo";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

const glass =
  "rounded-2xl border border-white/15 bg-white/6 backdrop-blur-xl shadow-[0_24px_60px_-24px_rgba(37,99,235,0.55)]";

export function ArrowDot() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#02060f] text-white" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className={`${manrope.className} dark-theme relative min-h-screen overflow-hidden bg-[#02060f] text-white`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 60% at 22% 40%, rgba(37,99,235,0.55), transparent 70%), radial-gradient(40% 40% at 90% 95%, rgba(14,165,233,0.25), transparent 70%)",
        }}
      />

      <header className="relative mx-auto flex max-w-6xl items-center px-6 py-6">
        <Link href="/" className="focus-visible:outline-white">
          <DarkLogo />
        </Link>
      </header>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 lg:grid-cols-2 lg:pb-24">
        <aside className="hidden lg:block" aria-hidden="true">
          <p
            className="text-6xl font-light leading-[0.98] tracking-tight"
            style={{
              backgroundImage: "linear-gradient(180deg,#ffffff 0%,#bae6fd 55%,#38bdf8 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Your month, clear.
          </p>
          <p className="mt-5 max-w-sm text-white/70">
            Add what you spend, set a limit for each category, and see how the month is going on one page.
          </p>

          <div className="relative mt-12 h-64">
            <div
              className={`${glass} absolute left-0 top-2 w-64 p-5`}
              style={{ transform: "perspective(900px) rotateX(16deg) rotateY(-20deg) rotateZ(5deg)" }}
            >
              <p className="text-xs text-white/60">Balance, sample data</p>
              <p className="mt-1 text-3xl font-light tabular-nums">₹39,400</p>
              <svg viewBox="0 0 200 60" className="mt-3 w-full">
                <path d="M0 48 C25 40 40 52 65 36 S110 30 130 22 S175 14 200 6" fill="none" stroke="#7dd3fc" strokeWidth="2" />
              </svg>
            </div>
            <div
              className={`${glass} absolute bottom-0 left-40 w-60 p-4`}
              style={{ transform: "perspective(900px) rotateX(14deg) rotateY(-18deg) rotateZ(-4deg)" }}
            >
              <div className="flex justify-between text-sm">
                <span>Groceries</span>
                <span className="tabular-nums text-white/80">82%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[82%] rounded-full bg-amber-300" />
              </div>
            </div>
          </div>
        </aside>

        <main className="mx-auto w-full max-w-md">
          <div className={`${glass} rounded-3xl p-7 sm:p-9`}>
            <h1 className="text-3xl font-light">{title}</h1>
            <p className="mt-2 text-sm text-white/65">{subtitle}</p>
            <div className="mt-7">{children}</div>
            <div className="mt-6 text-sm text-white/65">{footer}</div>
          </div>
        </main>
      </div>
    </div>
  );
}