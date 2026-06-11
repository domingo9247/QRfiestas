"use client";

import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { EventForm } from "@/components/EventForm";
import { deleteDemoEvent, getDemoEvents, isDemoAdminSession } from "@/lib/demoStore";
import { db } from "@/lib/firebase";
import { formatEventType, getUploadsByEventCode } from "@/lib/events";
import type { FiestaEvent } from "@/lib/types";

type EventWithCount = FiestaEvent & { uploadCount: number };

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingCode, setDeletingCode] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (isDemoAdminSession()) {
        const localEvents = getDemoEvents();
        let demoEvents = localEvents;
        try {
          const response = await fetch("/api/demo/events");
          const serverEvents = response.ok ? ((await response.json()) as FiestaEvent[]) : [];
          const serverCodes = new Set(serverEvents.map((eventItem) => eventItem.code));
          const missingLocalEvents = localEvents.filter((eventItem) => !serverCodes.has(eventItem.code));

          await Promise.all(
            missingLocalEvents.map((eventItem) =>
              fetch("/api/demo/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventItem)
              })
            )
          );

          demoEvents = [...missingLocalEvents, ...serverEvents];
        } catch {
          demoEvents = localEvents;
        }
        setEvents(demoEvents.map((eventItem) => ({ ...eventItem, uploadCount: 0 })));
        setLoading(false);
        return;
      }

      const eventsQuery = query(collection(db, "events"), orderBy("createdAt", "desc"));
      const eventsSnap = await getDocs(eventsQuery);
      const baseEvents = eventsSnap.docs.map((eventDoc) => ({ id: eventDoc.id, ...eventDoc.data() }) as FiestaEvent);
      const withCounts = await Promise.all(
        baseEvents.map(async (eventItem) => {
          const uploads = await getUploadsByEventCode(eventItem.code);
          return { ...eventItem, uploadCount: uploads.length };
        })
      );

      setEvents(withCounts);
      setLoading(false);
    }

    loadDashboard().catch(() => setLoading(false));
  }, []);

  const totalUploads = useMemo(() => events.reduce((total, eventItem) => total + eventItem.uploadCount, 0), [events]);

  async function handleDeleteEvent(eventItem: FiestaEvent) {
    const confirmed = window.confirm(`Borrar ${eventItem.name}? Se eliminara el evento del panel.`);
    if (!confirmed) return;

    setDeletingCode(eventItem.code);

    try {
      if (isDemoAdminSession()) {
        deleteDemoEvent(eventItem.code);
        await fetch(`/api/demo/events/${eventItem.code}`, { method: "DELETE" });
      } else {
        await deleteDoc(doc(db, "events", eventItem.id));
      }

      setEvents((current) => current.filter((item) => item.code !== eventItem.code));
    } finally {
      setDeletingCode("");
    }
  }

  return (
    <AdminShell>
      <div className="confetti-band mb-6 h-2 rounded-full" />
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="label">Panel principal</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Eventos</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {events.length} eventos · {totalUploads} archivos recibidos
          </p>
        </div>
        <button onClick={() => setShowForm((current) => !current)} className="btn-primary">
          {showForm ? "Ocultar formulario" : "Crear evento"}
        </button>
      </div>

      {showForm ? (
        <section className="mt-6">
          <EventForm />
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-4">
          <p className="label">Eventos</p>
          <h2 className="mt-1 text-2xl font-black text-ink">Fiestas activas</h2>
        </div>
        {loading ? <p className="text-sm font-semibold text-neutral-500">Cargando eventos...</p> : null}
        {!loading && !events.length ? (
          <div className="fiesta-card p-8 text-center">
            <h2 className="text-xl font-bold text-ink">Aun no hay eventos</h2>
            <p className="mt-2 text-sm text-neutral-500">Crea el primer evento para generar su QR y acceso de cliente.</p>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((eventItem) => (
            <article key={eventItem.id} className="fiesta-card p-5 transition hover:border-[#ff5b87]">
              <Link href={`/admin/events/${eventItem.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-ink">{eventItem.name}</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {formatEventType(eventItem.type)} · {eventItem.date}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">Acceso: {eventItem.clientEmail || "Sin email"}</p>
                  </div>
                  <span
                    className={
                      eventItem.active
                        ? "rounded bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                        : "rounded bg-neutral-200 px-3 py-1 text-xs font-bold text-neutral-600"
                    }
                  >
                    {eventItem.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded bg-neutral-50 p-3">
                    <span className="block text-neutral-500">Codigo</span>
                    <strong>{eventItem.code}</strong>
                  </div>
                  <div className="rounded bg-neutral-50 p-3">
                    <span className="block text-neutral-500">Archivos</span>
                    <strong>{eventItem.uploadCount}</strong>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleDeleteEvent(eventItem)}
                disabled={deletingCode === eventItem.code}
                className="btn-danger mt-4 w-full"
              >
                {deletingCode === eventItem.code ? "Borrando..." : "Borrar evento"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
