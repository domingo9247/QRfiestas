"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { isDemoAdminSession } from "@/lib/demoStore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext<User | null>(null);

export function useAdminUser() {
  return useContext(AuthContext);
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !isDemoAdminSession());
  const [blocked, setBlocked] = useState("");
  const [demo] = useState(() => isDemoAdminSession());

  useEffect(() => {
    if (demo) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setBlocked("");

      if (!currentUser) {
        setUser(null);
        setLoading(false);
        router.replace("/admin/login");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      const role = userSnap.data()?.role;

      if (role !== "admin") {
        setUser(null);
        setBlocked(`Este usuario no tiene rol admin. UID: ${currentUser.uid}`);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [demo, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Cargando panel</p>
      </main>
    );
  }

  if (blocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-6">
        <div className="max-w-lg rounded border border-neutral-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black text-ink">Acceso administrativo bloqueado</h1>
          <p className="mt-3 break-all text-sm text-neutral-600">{blocked}</p>
          <p className="mt-3 text-sm text-neutral-500">Agrega este UID en Firestore, coleccion users, con role admin.</p>
        </div>
      </main>
    );
  }

  if (!user && !demo) return null;

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
