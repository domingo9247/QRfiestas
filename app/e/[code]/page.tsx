"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UploadForm } from "@/components/UploadForm";
import { getEventByCode } from "@/lib/events";
import type { FiestaEvent } from "@/lib/types";

export default function PublicEventPage() {
  const params = useParams<{ code: string }>();
  const [eventData, setEventData] = useState<FiestaEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      try {
        const eventItem = await getEventByCode(params.code);
        if (!cancelled) setEventData(eventItem);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvent().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [params.code]);

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <section className="gold-ring px-5 py-10 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.24em] text-champagne">
            QR Fiesta
          </Link>
          <h1 className="mt-6 text-4xl font-black md:text-6xl">{eventData?.name ?? "Evento"}</h1>
          <p className="mt-4 text-sm text-neutral-300">Comparte tus mejores fotos y videos del momento.</p>
        </div>
      </section>
      <section className="px-5 py-8">
        {loading ? <p className="text-center text-sm font-semibold text-neutral-500">Cargando evento...</p> : null}
        {!loading && !eventData ? (
          <div className="mx-auto max-w-xl rounded border border-neutral-200 bg-white p-8 text-center">
            <h2 className="text-2xl font-black text-ink">Evento no encontrado</h2>
            <p className="mt-2 text-sm text-neutral-500">Revisa que el código del QR sea correcto.</p>
          </div>
        ) : null}
        {eventData && !eventData.active ? (
          <div className="mx-auto max-w-xl rounded border border-neutral-200 bg-white p-8 text-center">
            <h2 className="text-2xl font-black text-ink">Evento inactivo</h2>
            <p className="mt-2 text-sm text-neutral-500">La carga de archivos está desactivada por el administrador.</p>
          </div>
        ) : null}
        {eventData && eventData.active ? <UploadForm eventData={eventData} /> : null}
      </section>
    </main>
  );
}
