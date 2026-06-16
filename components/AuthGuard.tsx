"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { hasAdminSession } from "@/lib/adminSession";
import { isDemoAdminSession } from "@/lib/demoStore";

const AuthContext = createContext<boolean>(false);

export function useAdminUser() {
  return useContext(AuthContext);
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed] = useState(() => hasAdminSession() || isDemoAdminSession());

  useEffect(() => {
    if (!allowed) router.replace("/admin/login");
  }, [allowed, router]);

  if (!allowed) return null;

  return <AuthContext.Provider value>{children}</AuthContext.Provider>;
}
