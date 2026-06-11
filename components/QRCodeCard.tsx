"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  title?: string;
};

export function QRCodeCard({ url, title = "QR del evento" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    QRCode.toCanvas(canvasRef.current, url, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0b0b0d",
        light: "#ffffff"
      }
    }).then(() => setReady(true));
  }, [url]);

  function downloadQr() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qr-fiesta.png";
    link.click();
  }

  return (
    <section className="rounded border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="mt-1 break-all text-sm text-neutral-500">{url}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <canvas ref={canvasRef} className="rounded border border-neutral-200 bg-white p-2" />
        <button onClick={downloadQr} disabled={!ready} className="btn-primary w-full">
          Descargar QR
        </button>
      </div>
    </section>
  );
}
