"use client";

import { doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { QRCodeCard } from "@/components/QRCodeCard";
import { isDemoAdminSession, updateDemoEvent } from "@/lib/demoStore";
import { db } from "@/lib/firebase";
import { formatEventType, getEventByCode, getUploadsByEventCode } from "@/lib/events";
import { getFileKind } from "@/lib/uploads";
import type { FiestaEvent, UploadItem } from "@/lib/types";

export default function AdminEventPage() {
  const params = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<FiestaEvent | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const presentationUrl =
    typeof window !== "undefined" && eventData ? `${window.location.origin}/presentacion/${eventData.code}` : "";

  useEffect(() => {
    async function loadEvent() {
      const eventItem = await getEventByCode(params.id);
      if (eventItem) {
        const uploadItems = await getUploadsByEventCode(eventItem.code);
        setEventData(eventItem);
        setUploads(uploadItems);
      }
      setLoading(false);
    }

    loadEvent().catch(() => setLoading(false));
  }, [params.id]);

  const sortedUploads = useMemo(
    () => [...uploads].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)),
    [uploads]
  );

  async function toggleActive() {
    if (!eventData) return;
    setSaving(true);
    if (isDemoAdminSession()) {
      const updatedEvent = { ...eventData, active: !eventData.active };
      updateDemoEvent(updatedEvent);
      await fetch(`/api/demo/events/${eventData.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedEvent.active })
      });
      setEventData(updatedEvent);
      setSaving(false);
      return;
    }
    await updateDoc(doc(db, "events", eventData.id), { active: !eventData.active });
    setEventData({ ...eventData, active: !eventData.active });
    setSaving(false);
  }

  return (
    <AdminShell>
      {loading ? <p className="text-sm font-semibold text-neutral-500">Cargando evento...</p> : null}
      {!loading && !eventData ? (
        <div className="rounded border border-neutral-200 bg-white p-8">
          <h1 className="text-2xl font-black text-ink">Evento no encontrado</h1>
        </div>
      ) : null}
      {eventData ? (
        <>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="label">{formatEventType(eventData.type)} · {eventData.code}</p>
              <h1 className="mt-2 text-3xl font-black text-ink">{eventData.name}</h1>
              <p className="mt-2 break-all text-sm text-neutral-500">{eventData.publicUrl}</p>
              {presentationUrl ? (
                <p className="mt-1 break-all text-sm text-neutral-500">Presentacion: {presentationUrl}</p>
              ) : null}
              {eventData.clientGalleryUrl ? (
                <p className="mt-1 break-all text-sm text-neutral-500">Cliente: {eventData.clientGalleryUrl}</p>
              ) : null}
            </div>
            <button onClick={toggleActive} disabled={saving} className="btn-secondary">
              {eventData.active ? "Desactivar evento" : "Activar evento"}
            </button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
            <QRCodeCard url={eventData.publicUrl} />
            <section className="rounded border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-ink">Resumen</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded bg-neutral-50 p-4">
                  <span className="block text-sm text-neutral-500">Estado</span>
                  <strong>{eventData.active ? "Activo" : "Inactivo"}</strong>
                </div>
                <div className="rounded bg-neutral-50 p-4">
                  <span className="block text-sm text-neutral-500">Archivos</span>
                  <strong>{uploads.length}</strong>
                </div>
                <div className="rounded bg-neutral-50 p-4">
                  <span className="block text-sm text-neutral-500">Límite</span>
                  <strong>{eventData.photoLimit}</strong>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded bg-neutral-50 p-4">
                  <span className="block text-sm text-neutral-500">Cliente</span>
                  <strong>{eventData.clientName || "Sin cliente asignado"}</strong>
                  {eventData.clientEmail ? <p className="mt-1 text-sm text-neutral-500">{eventData.clientEmail}</p> : null}
                  {eventData.clientPassword ? (
                    <p className="mt-1 text-sm text-neutral-500">Password temporal: {eventData.clientPassword}</p>
                  ) : null}
                </div>
                <div className="rounded bg-neutral-50 p-4">
                  <span className="block text-sm text-neutral-500">Liga para invitados</span>
                  <p className="break-all text-sm font-semibold text-ink">{eventData.publicUrl}</p>
                </div>
                {eventData.clientGalleryUrl ? (
                  <div className="rounded bg-neutral-50 p-4">
                    <span className="block text-sm text-neutral-500">Liga privada del cliente</span>
                    <p className="break-all text-sm font-semibold text-ink">{eventData.clientGalleryUrl}</p>
                  </div>
                ) : null}
                {presentationUrl ? (
                  <div className="rounded bg-neutral-50 p-4">
                    <span className="block text-sm text-neutral-500">Liga para pantalla grande</span>
                    <p className="break-all text-sm font-semibold text-ink">{presentationUrl}</p>
                    <a href={presentationUrl} target="_blank" rel="noreferrer" className="btn-primary mt-3 w-full py-2">
                      Abrir presentacion
                    </a>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-ink">Galería</h2>
              <span className="text-sm font-semibold text-neutral-500">{uploads.length} archivos</span>
            </div>
            {!uploads.length ? (
              <div className="rounded border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
                Todavía no hay fotos ni videos.
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedUploads.map((upload) => (
                <article key={upload.id} className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
                  <div className="aspect-square bg-neutral-100">
                    {getFileKind(upload.fileType) === "video" ? (
                      <video src={upload.fileUrl} controls className="h-full w-full object-cover" />
                    ) : (
                      <Image
                        src={upload.fileUrl}
                        alt={upload.fileName}
                        width={500}
                        height={500}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-sm font-bold text-ink">{upload.fileName}</h3>
                    <p className="mt-1 text-sm text-neutral-500">Invitado: {upload.guestName || "Sin nombre"}</p>
                    <a href={upload.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-4 w-full py-2">
                      Descargar archivo
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
