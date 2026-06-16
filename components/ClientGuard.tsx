"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { getClientSession } from "@/lib/clientSession";

const ClientContext = createContext<string>("");

export function useClientUser() {
  return useContext(ClientContext);
}

export function ClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [clientUid] = useState(() => getClientSession());

  useEffect(() => {
    if (!clientUid) {
      router.replace("/cliente/login");
    }
  }, [clientUid, router]);

  if (!clientUid) return null;

  return <ClientContext.Provider value={clientUid}>{children}</ClientContext.Provider>;
}
