import { auth } from "@/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="mt-4">Signed in as {session?.user?.name ?? session?.user?.email}</p>
    </main>
  );
}