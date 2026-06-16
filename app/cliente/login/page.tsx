"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getDemoClients, startDemoClientSession } from "@/lib/demoStore";
import { startClientSession } from "@/lib/clientSession";
import { db, hasFirebaseConfig } from "@/lib/firebase";
import type { FiestaEvent } from "@/lib/types";

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!hasFirebaseConfig()) {
      let clientUid = "";
      const client = getDemoClients().find(
        (item) => item.email.trim().toLowerCase() === email.trim().toLowerCase() && item.password === password
      );

      if (client) clientUid = client.uid;

      if (!clientUid) {
        const response = await fetch("/api/demo/events");
        const events = response.ok ? ((await response.json()) as FiestaEvent[]) : [];
        const eventItem = events.find(
          (item) => item.clientEmail?.trim().toLowerCase() === email.trim().toLowerCase() && item.clientPassword === password
        );
        if (eventItem?.clientUid) clientUid = eventItem.clientUid;
      }

      if (clientUid) {
        startDemoClientSession(clientUid);
        router.push("/cliente");
      } else {
        setError("Email o contrasena incorrectos. Usa el cliente creado desde el panel admin.");
      }

      setLoading(false);
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const eventsQuery = query(collection(db, "events"), where("clientEmail", "==", normalizedEmail));
      const exactSnap = await getDocs(eventsQuery);
      let events = exactSnap.docs.map((eventDoc) => ({ id: eventDoc.id, ...eventDoc.data() }) as FiestaEvent);

      if (!events.length) {
        const allSnap = await getDocs(collection(db, "events"));
        events = allSnap.docs.map((eventDoc) => ({ id: eventDoc.id, ...eventDoc.data() }) as FiestaEvent);
      }

      const eventItem = events.find(
        (item) =>
          item.clientEmail?.trim().toLowerCase() === normalizedEmail &&
          item.clientPassword?.trim() === normalizedPassword
      );

      if (!eventItem?.clientUid) {
        setError("Email o contrasena incorrectos. Usa el acceso que se creo dentro del evento.");
        return;
      }

      startClientSession(eventItem.clientUid);
      router.push("/cliente");
    } catch {
      setError("No se pudo validar el acceso del cliente. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gold-ring flex min-h-screen items-center justify-center px-5 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded border border-white/15 bg-white p-6 shadow-glow">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.24em] text-champagne">
          QR Fiesta
        </Link>
        <h1 className="mt-5 text-3xl font-black text-ink">Acceso cliente</h1>
        <p className="mt-2 text-sm text-neutral-500">Entra para ver las fotos y videos de tu evento.</p>
        <label className="mt-6 block space-y-2">
          <span className="label">Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="field" />
        </label>
        <label className="mt-4 block space-y-2">
          <span className="label">Contrasena</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="field"
          />
        </label>
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
        <button disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
