"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { getDemoClientSession } from "@/lib/demoStore";
import { auth, db, hasFirebaseConfig } from "@/lib/firebase";

const ClientContext = createContext<User | null>(null);

export function useClientUser() {
  return useContext(ClientContext);
}

export function ClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const demoMode = !hasFirebaseConfig();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !demoMode);
  const [blocked, setBlocked] = useState("");

  useEffect(() => {
    if (demoMode) {
      if (!getDemoClientSession()) router.replace("/cliente/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setBlocked("");

      if (!currentUser) {
        setUser(null);
        setLoading(false);
        router.replace("/cliente/login");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      const role = userSnap.data()?.role;

      if (role !== "client" && role !== "admin") {
        setUser(null);
        setBlocked("Este usuario no tiene acceso a la zona de cliente.");
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [demoMode, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Cargando cliente</p>
      </main>
    );
  }

  if (blocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-6">
        <div className="max-w-lg rounded border border-neutral-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black text-ink">Acceso bloqueado</h1>
          <p className="mt-3 text-sm text-neutral-600">{blocked}</p>
        </div>
      </main>
    );
  }

  if (!user && !demoMode) return null;

  return <ClientContext.Provider value={user}>{children}</ClientContext.Provider>;
}
