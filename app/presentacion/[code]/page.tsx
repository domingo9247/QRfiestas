"use client";

import QRCode from "qrcode";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getEventByCode, getUploadsByEventCode } from "@/lib/events";
import { getFileKind } from "@/lib/uploads";
import type { FiestaEvent, UploadItem } from "@/lib/types";

const rotateMs = 6500;

export default function PresentationPage() {
  const params = useParams<{ code: string }>();
  const [eventData, setEventData] = useState<FiestaEvent | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPresentation() {
      const eventItem = await getEventByCode(params.code);
      const uploadItems = eventItem ? await getUploadsByEventCode(eventItem.code) : [];

      if (cancelled) return;
      setEventData(eventItem);
      setUploads(uploadItems);
      setLoading(false);

      if (eventItem?.publicUrl) {
        const dataUrl = await QRCode.toDataURL(eventItem.publicUrl, {
          width: 220,
          margin: 2,
          color: { dark: "#151019", light: "#ffffff" }
        });
        if (!cancelled) setQrUrl(dataUrl);
      }
    }

    loadPresentation().catch(() => setLoading(false));
    const refresh = window.setInterval(loadPresentation, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, [params.code]);

  useEffect(() => {
    if (!uploads.length) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % uploads.length);
    }, rotateMs);

    return () => window.clearInterval(timer);
  }, [uploads.length]);

  const sortedUploads = useMemo(
    () => [...uploads].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)),
    [uploads]
  );
  const featured = sortedUploads[currentIndex % Math.max(sortedUploads.length, 1)];
  const sideItems = sortedUploads.filter((item) => item.id !== featured?.id).slice(0, 6);

  if (loading) {
    return (
      <main className="gold-ring flex min-h-screen items-center justify-center px-6 text-white">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#ffcc5c]">Preparando presentacion</p>
      </main>
    );
  }

  if (!eventData) {
    return (
      <main className="gold-ring flex min-h-screen items-center justify-center px-6 text-white">
        <div className="text-center">
          <h1 className="text-5xl font-black">Evento no encontrado</h1>
          <p className="mt-4 text-neutral-200">Revisa el codigo de la presentacion.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="gold-ring min-h-screen overflow-hidden text-white">
      <div className="confetti-band h-2 w-full" />
      <section className="grid min-h-[calc(100vh-8px)] grid-rows-[1fr_auto] px-6 py-6 lg:px-10">
        <div className="grid min-h-0 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="relative min-h-[58vh] overflow-hidden rounded border border-white/15 bg-black/30 shadow-glow">
            {featured ? (
              getFileKind(featured.fileType) === "video" ? (
                <video key={featured.id} src={featured.fileUrl} autoPlay muted loop playsInline className="h-full w-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={featured.id} src={featured.fileUrl} alt={featured.fileName} className="h-full w-full object-contain" />
              )
            ) : (
              <div className="flex h-full min-h-[58vh] flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#ffcc5c]">Aun no hay recuerdos</p>
                <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight md:text-7xl">
                  Sube tus recuerdos y veamos las mejores risas
                </h1>
              </div>
            )}

            {featured ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#ffcc5c]">{eventData.name}</p>
                <h1 className="mt-2 text-3xl font-black md:text-5xl">Recuerdos en vivo</h1>
                <p className="mt-2 text-lg text-white/85">Invitado: {featured.guestName || "Sin nombre"}</p>
              </div>
            ) : null}
          </div>

          <aside className="grid content-between gap-5">
            <div className="rounded border border-white/15 bg-white/95 p-5 text-ink shadow-glow">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff5b87]">Participa</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">Sube tus recuerdos</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Escanea el QR, comparte tus fotos y videos, y hagamos aparecer las mejores risas en pantalla.
              </p>
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="QR para subir recuerdos" className="mx-auto mt-5 w-48 rounded bg-white p-2" />
              ) : null}
              <p className="mt-4 break-all text-center text-xs font-semibold text-neutral-500">{eventData.publicUrl}</p>
            </div>

            <div className="rounded border border-white/15 bg-white/10 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffcc5c]">Galeria</p>
                  <h2 className="mt-1 text-2xl font-black">{uploads.length} recuerdos</h2>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {sideItems.map((item) => (
                  <div key={item.id} className="aspect-square overflow-hidden rounded bg-white/10">
                    {getFileKind(item.fileType) === "video" ? (
                      <video src={item.fileUrl} muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.fileUrl} alt={item.fileName} className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-6 flex flex-col items-center justify-between gap-3 rounded border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur md:flex-row md:text-left">
          <p className="text-lg font-black">QR Fiesta · {eventData.name}</p>
          <p className="text-sm font-semibold text-white/80">Escanea, sube tus recuerdos y vuelve a la fiesta.</p>
        </footer>
      </section>
    </main>
  );
}
