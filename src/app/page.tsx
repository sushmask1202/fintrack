import Link from "next/link";
import { redirect } from "next/navigation";
import { Manrope } from "next/font/google";
import { auth } from "@/auth";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

const glass =
  "rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[0_24px_60px_-24px_rgba(37,99,235,0.55)]";

const ledger = [
  { date: "1 Nov", label: "Salary", amount: "+₹62,000", income: true },
  { date: "1 Nov", label: "Rent", amount: "−₹18,000", income: false },
  { date: "3 Nov", label: "Groceries", amount: "−₹2,340", income: false },
  { date: "6 Nov", label: "Groceries", amount: "−₹1,760", income: false },
  { date: "7 Nov", label: "Metro card", amount: "−₹500", income: false },
];

const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const incomeBars = [55, 48, 62, 50, 58, 70];
const expenseBars = [32, 40, 35, 44, 30, 38];

const chips = ["Income and expense totals", "Spending by category", "Six-month trend", "Monthly budgets"];

function Mark() {
  return (
    <span className="inline-flex items-center gap-2 text-lg font-semibold">
      <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#ffffff" fillOpacity="0.14" stroke="#ffffff" strokeOpacity="0.4" />
        <rect x="7" y="14" width="3.5" height="7" rx="1" fill="#7dd3fc" />
        <rect x="12.25" y="10" width="3.5" height="11" rx="1" fill="#7dd3fc" />
        <rect x="17.5" y="6" width="3.5" height="15" rx="1" fill="#7dd3fc" />
      </svg>
      FinTrack
    </span>
  );
}

function Glow({ background }: { background: string }) {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background }} />;
}

function Pill({ href, children, solid = false }: { href: string; children: React.ReactNode; solid?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 rounded-full border py-2 pl-5 pr-2 text-sm font-medium backdrop-blur transition-colors focus-visible:outline-white ${
        solid
          ? "border-white bg-white text-[#02060f] hover:bg-white/90"
          : "border-white/20 bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {children}
      <span className={`grid h-8 w-8 place-items-center rounded-full ${solid ? "bg-[#02060f] text-white" : "bg-white text-[#02060f]"}`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
   <div className={`${manrope.className} dark-theme min-h-screen bg-[#02060f] text-white`}>
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <Glow background="radial-gradient(55% 60% at 72% 38%, rgba(37,99,235,0.6), transparent 70%), radial-gradient(40% 40% at 10% 90%, rgba(14,165,233,0.25), transparent 70%)" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Mark />
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/login" className="text-white/80 hover:text-white focus-visible:outline-white">Log in</Link>
            <Link href="/signup" className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur hover:bg-white/20 focus-visible:outline-white">
              Sign up
            </Link>
          </nav>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-6 lg:grid-cols-2 lg:pb-28 lg:pt-12">
          <div>
            <h1
              className="text-6xl font-light leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
              style={{
                backgroundImage: "linear-gradient(180deg,#ffffff 0%,#bae6fd 55%,#38bdf8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Your month, clear.
            </h1>
            <p className="mt-6 max-w-sm text-white/70">
              Log what you earn and spend, set a limit for each category, and see the whole month on one page.
            </p>
            <div className="mt-8">
              <Pill href="/signup">Get started</Pill>
            </div>
          </div>

          <div className="relative h-[380px] sm:h-[460px]" aria-hidden="true">
            <div className="absolute right-0 top-0 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Private by design
            </div>

            <div
              className={`${glass} absolute left-[4%] top-[12%] w-[62%] p-5`}
              style={{ transform: "perspective(900px) rotateX(18deg) rotateY(-22deg) rotateZ(6deg)" }}
            >
              <p className="text-xs text-white/60">Balance, sample data</p>
              <p className="mt-1 text-3xl font-light tabular-nums">₹39,400</p>
              <svg viewBox="0 0 200 60" className="mt-4 w-full">
                <path d="M0 48 C25 40 40 52 65 36 S110 30 130 22 S175 14 200 6" fill="none" stroke="#7dd3fc" strokeWidth="2" />
              </svg>
            </div>

            <div
              className={`${glass} absolute bottom-[2%] right-[2%] w-[60%] p-4`}
              style={{ transform: "perspective(900px) rotateX(14deg) rotateY(-18deg) rotateZ(-4deg)" }}
            >
              <ul className="space-y-2 text-sm">
                {ledger.slice(0, 3).map((row, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{row.label}</span>
                    <span className={`tabular-nums ${row.income ? "text-emerald-300" : "text-white/80"}`}>{row.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Ledger */}
      <section className="relative overflow-hidden border-t border-white/10">
        <Glow background="radial-gradient(50% 60% at 50% 65%, rgba(14,165,233,0.26), transparent 70%)" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-[1fr_1.4fr_1fr] lg:py-28">
          <div>
            <p className="text-xl font-light">Transactions</p>
            <p className="mt-2 max-w-[16rem] text-sm text-white/65">
              Add, edit and delete entries. Each one has an amount, a category, a date and an optional note.
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-light leading-tight sm:text-4xl">Every rupee in one ledger</h2>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              Log income and expenses in seconds, then filter by type, category or date to find anything.
            </p>
            <div className={`${glass} mx-auto mt-8 max-w-md p-5 text-left`} aria-hidden="true">
              <ul className="divide-y divide-white/10 text-sm">
                {ledger.map((row, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5">
                    <span>
                      <span className="mr-3 inline-block w-12 text-white/50">{row.date}</span>
                      {row.label}
                    </span>
                    <span className={`tabular-nums ${row.income ? "text-emerald-300" : ""}`}>{row.amount}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-white/50">Sample data</p>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <p className="max-w-[16rem] text-sm text-white/65">
              Amounts are stored to the paisa, so your totals always add up.
            </p>
            <div className="mt-6">
              <Pill href="#budgets">See budgets</Pill>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Budgets */}
      <section id="budgets" className="relative overflow-hidden border-t border-white/10">
        <Glow background="radial-gradient(55% 60% at 25% 45%, rgba(37,99,235,0.5), transparent 70%)" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <h2
              className="text-5xl font-light leading-[1.02] tracking-tight sm:text-6xl"
              style={{
                backgroundImage: "linear-gradient(180deg,#ffffff 0%,#bae6fd 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Set a limit. Stay ahead of it.
            </h2>

            <div className={`${glass} mt-10 max-w-md space-y-5 p-6`} aria-hidden="true">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Groceries</span>
                  <span className="tabular-nums text-white/80">₹4,100 of ₹5,000</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[82%] rounded-full bg-amber-300" />
                </div>
                <p className="mt-2 text-xs text-white/60">82% used. Close to the limit.</p>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Transport</span>
                  <span className="tabular-nums text-white/80">₹500 of ₹1,500</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[33%] rounded-full bg-sky-300" />
                </div>
                <p className="mt-2 text-xs text-white/60">33% used.</p>
              </div>
              <p className="text-xs text-white/50">Sample data</p>
            </div>
          </div>

          <div className="lg:self-end">
            <p className="max-w-sm text-white/70">
              Give each category a monthly limit. The bar turns amber at 80% and red once you go over, so you notice before the month ends.
            </p>
            <div className="mt-6">
              <Pill href="/signup">Create free account</Pill>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dashboard */}
      <section className="relative overflow-hidden border-t border-white/10">
        <Glow background="radial-gradient(60% 55% at 50% 40%, rgba(14,165,233,0.3), transparent 70%)" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              Private by design
            </span>
            <h2 className="mt-5 text-4xl font-light sm:text-5xl">Your month in one view</h2>
            <p className="mt-4 text-white/70">
              Totals, spending by category and a six-month trend, updated as you add transactions. Each account sees only its own data.
            </p>
          </div>

          <div className={`${glass} mx-auto mt-12 grid max-w-4xl gap-8 p-6 sm:p-8 md:grid-cols-2`} aria-hidden="true">
            <div>
              <p className="text-sm text-white/60">Balance for November, sample data</p>
              <p className="mt-1 text-4xl font-light tabular-nums">₹39,400</p>
              <p className="mt-1 text-sm text-white/70">You kept 64% of what came in.</p>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 text-sm">
                <div>
                  <dt className="text-white/60">Income</dt>
                  <dd className="mt-1 text-lg tabular-nums">₹62,000</dd>
                </div>
                <div>
                  <dt className="text-white/60">Expenses</dt>
                  <dd className="mt-1 text-lg tabular-nums">₹22,600</dd>
                </div>
              </dl>
              <ul className="mt-5 space-y-1.5 text-sm text-white/80">
                <li className="flex justify-between"><span>Rent</span><span className="tabular-nums">₹18,000</span></li>
                <li className="flex justify-between"><span>Groceries</span><span className="tabular-nums">₹4,100</span></li>
                <li className="flex justify-between"><span>Transport</span><span className="tabular-nums">₹500</span></li>
              </ul>
            </div>

            <div className="flex h-56 items-end gap-3 self-end">
              {months.map((m, i) => (
                <div key={m} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end justify-center gap-1">
                    <div className="w-2.5 rounded-t bg-sky-300" style={{ height: `${incomeBars[i]}%` }} />
                    <div className="w-2.5 rounded-t bg-white/40" style={{ height: `${expenseBars[i]}%` }} />
                  </div>
                  <span className="text-[10px] text-white/50">{m}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
            {chips.map((c) => (
              <li key={c} className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white/85 backdrop-blur">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="relative overflow-hidden border-t border-white/10">
        <Glow background="radial-gradient(50% 80% at 50% 120%, rgba(37,99,235,0.55), transparent 70%)" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
          <h2 className="text-4xl font-light sm:text-6xl">Start with this month.</h2>
          <p className="mt-4 text-white/70">Free to use. Create an account and log your first transaction in a minute.</p>
          <div className="mt-8">
            <Pill href="/signup" solid>Create free account</Pill>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-white/60">
          <span>FinTrack, a portfolio project built with Next.js, Prisma and PostgreSQL.</span>
          <a href="https://github.com/sushmask1202/fintrack" className="underline hover:text-white focus-visible:outline-white">
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}