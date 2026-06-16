"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { useClientUser } from "@/components/ClientGuard";
import { QRCodeCard } from "@/components/QRCodeCard";
import { getDemoClientSession } from "@/lib/demoStore";
import { hasFirebaseConfig } from "@/lib/firebase";
import { getEventByCode, getUploadsByEventCode } from "@/lib/events";
import { getFileKind } from "@/lib/uploads";
import type { FiestaEvent, UploadItem } from "@/lib/types";

function ClientEventContent() {
  const params = useParams<{ id: string }>();
  const clientUid = useClientUser();
  const [eventData, setEventData] = useState<FiestaEvent | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const presentationUrl =
    typeof window !== "undefined" && eventData ? `${window.location.origin}/presentacion/${eventData.code}` : "";

  useEffect(() => {
    async function loadEvent() {
      const activeClientUid = clientUid || getDemoClientSession();

      if (!activeClientUid) return;
      const eventItem = await getEventByCode(params.id);

      if (!eventItem || eventItem.clientUid !== activeClientUid) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      const uploadItems = await getUploadsByEventCode(eventItem.code);
      setEventData(eventItem);
      setUploads(uploadItems);
      setLoading(false);
    }

    loadEvent().catch(() => setLoading(false));
  }, [clientUid, params.id]);

  const sortedUploads = useMemo(
    () => [...uploads].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)),
    [uploads]
  );

  if (loading) return <p className="text-sm font-semibold text-neutral-500">Cargando evento...</p>;

  if (notAllowed || !eventData) {
    return (
      <div className="rounded border border-neutral-200 bg-white p-8">
        <h1 className="text-2xl font-black text-ink">Evento no disponible</h1>
        <p className="mt-2 text-sm text-neutral-500">Este usuario no tiene acceso a este evento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="label">{eventData.code}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{eventData.name}</h1>
          <p className="mt-2 break-all text-sm text-neutral-500">Liga para invitados: {eventData.publicUrl}</p>
          {presentationUrl ? (
            <p className="mt-1 break-all text-sm text-neutral-500">Pantalla grande: {presentationUrl}</p>
          ) : null}
        </div>
        {presentationUrl ? (
          <a href={presentationUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Abrir presentacion
          </a>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        <QRCodeCard url={eventData.publicUrl} title="QR para invitados" />
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
              <span className="block text-sm text-neutral-500">Limite</span>
              <strong>{eventData.photoLimit}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink">Galeria</h2>
          <span className="text-sm font-semibold text-neutral-500">{uploads.length} archivos</span>
        </div>
        {!uploads.length ? (
          <div className="rounded border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            Todavia no hay fotos ni videos.
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
  );
}

export default function ClientEventPage() {
  return (
    <ClientShell>
      <ClientEventContent />
    </ClientShell>
  );
}
