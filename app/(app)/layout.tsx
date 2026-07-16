import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { getCurrentUser } from "@/lib/session";

// The authed app shell. Anyone without a valid session is sent to /login.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="app">
      <Sidebar user={{ name: user.name, role: user.role }} />
      <main className="main">
        <div className="wrap">
          <Topbar user={{ name: user.name, streak: user.streak }} />
          {children}
        </div>
      </main>
    </div>
  );
}
