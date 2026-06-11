"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { endDemoAdminSession } from "@/lib/demoStore";
import { auth } from "@/lib/firebase";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    endDemoAdminSession();
    await signOut(auth);
    router.push("/");
  }

  return (
    <AuthGuard>
      <main className="min-h-screen">
        <header className="border-b border-white/70 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/admin" className="text-lg font-black tracking-[0.18em] text-ink">
              QR FIESTA
            </Link>
            <button onClick={handleLogout} className="btn-secondary py-2">
              Cerrar sesion
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
      </main>
    </AuthGuard>
  );
}
