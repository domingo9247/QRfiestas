"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { useClientUser } from "@/components/ClientGuard";
import { getDemoClientSession } from "@/lib/demoStore";
import { db, hasFirebaseConfig } from "@/lib/firebase";
import { formatEventType, getUploadsByEventCode } from "@/lib/events";
import type { FiestaEvent } from "@/lib/types";

type EventWithCount = FiestaEvent & { uploadCount: number };

function ClientEvents() {
  const user = useClientUser();
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      if (!hasFirebaseConfig()) {
        const demoClientUid = getDemoClientSession();
        const response = await fetch("/api/demo/events");
        const allEvents = response.ok ? ((await response.json()) as FiestaEvent[]) : [];
        const baseEvents = allEvents.filter((eventItem) => eventItem.clientUid === demoClientUid);
        const withCounts = await Promise.all(
          baseEvents.map(async (eventItem) => {
            const uploads = await getUploadsByEventCode(eventItem.code);
            return { ...eventItem, uploadCount: uploads.length };
          })
        );
        setEvents(withCounts);
        setLoading(false);
        return;
      }

      if (!user) return;
      const eventsQuery = query(collection(db, "events"), where("clientUid", "==", user.uid));
      const snap = await getDocs(eventsQuery);
      const baseEvents = snap.docs.map((eventDoc) => ({ id: eventDoc.id, ...eventDoc.data() }) as FiestaEvent);
      const withCounts = await Promise.all(
        baseEvents.map(async (eventItem) => {
          const uploads = await getUploadsByEventCode(eventItem.code);
          return { ...eventItem, uploadCount: uploads.length };
        })
      );
      setEvents(withCounts);
      setLoading(false);
    }

    loadEvents().catch(() => setLoading(false));
  }, [user]);

  return (
    <>
      <div>
        <p className="label">Mis eventos</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Galerias</h1>
        <p className="mt-2 text-sm text-neutral-500">Fotos y videos recibidos por QR.</p>
      </div>

      <section className="mt-8">
        {loading ? <p className="text-sm font-semibold text-neutral-500">Cargando eventos...</p> : null}
        {!loading && !events.length ? (
          <div className="rounded border border-neutral-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-ink">No hay eventos asignados</h2>
            <p className="mt-2 text-sm text-neutral-500">Pide al administrador que asigne tu evento a este usuario.</p>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((eventItem) => (
            <Link
              key={eventItem.id}
              href={`/cliente/events/${eventItem.id}`}
              className="rounded border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-champagne"
            >
              <h2 className="text-xl font-bold text-ink">{eventItem.name}</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {formatEventType(eventItem.type)} · {eventItem.date}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded bg-neutral-50 p-3">
                  <span className="block text-neutral-500">Codigo QR</span>
                  <strong>{eventItem.code}</strong>
                </div>
                <div className="rounded bg-neutral-50 p-3">
                  <span className="block text-neutral-500">Archivos</span>
                  <strong>{eventItem.uploadCount}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default function ClientDashboardPage() {
  return (
    <ClientShell>
      <ClientEvents />
    </ClientShell>
  );
}
