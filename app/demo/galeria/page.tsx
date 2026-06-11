const mockItems = [
  {
    fileName: "entrada-novios.jpg",
    guestName: "Mariana",
    type: "photo",
    className: "bg-[radial-gradient(circle_at_30%_20%,#fff7df_0_12%,transparent_13%),linear-gradient(135deg,#1c1c1f,#8b6f35_52%,#f5e4b1)]"
  },
  {
    fileName: "brindis.mp4",
    guestName: "Carlos",
    type: "video",
    className: "bg-[radial-gradient(circle_at_70%_35%,#ffffff_0_10%,transparent_11%),linear-gradient(135deg,#0b0b0d,#4f4f55_46%,#d6b25e)]"
  },
  {
    fileName: "mesa-familia.png",
    guestName: "Lucia",
    type: "photo",
    className: "bg-[radial-gradient(circle_at_52%_28%,#fff_0_13%,transparent_14%),linear-gradient(135deg,#2b2b2f,#716c64_48%,#ead8a4)]"
  },
  {
    fileName: "baile.mov",
    guestName: "Sofia",
    type: "video",
    className: "bg-[radial-gradient(circle_at_38%_32%,#fff4c8_0_11%,transparent_12%),linear-gradient(135deg,#09090b,#2f2b27_44%,#c9a24e)]"
  },
  {
    fileName: "pastel.jpg",
    guestName: "",
    type: "photo",
    className: "bg-[radial-gradient(circle_at_60%_30%,#fff_0_12%,transparent_13%),linear-gradient(135deg,#19191d,#74695b_54%,#f2dfaa)]"
  },
  {
    fileName: "amigos.jpg",
    guestName: "Invitado",
    type: "photo",
    className: "bg-[radial-gradient(circle_at_45%_22%,#fff8dc_0_10%,transparent_11%),linear-gradient(135deg,#101012,#57575e_48%,#d6b25e)]"
  }
];

export default function DemoGalleryPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <section className="gold-ring px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-champagne">Vista previa</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Galeria del evento</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
            Asi se verian las fotos y videos que suben los invitados desde el QR.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">Boda Ana y Luis</h2>
            <p className="mt-1 text-sm text-neutral-500">6 archivos recibidos</p>
          </div>
          <span className="rounded bg-green-100 px-3 py-1 text-xs font-bold text-green-800">Activo</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockItems.map((item) => (
            <article key={item.fileName} className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
              <div className={`relative aspect-square ${item.className}`}>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="rounded bg-white/90 px-3 py-1 text-xs font-bold text-ink">
                    {item.type === "video" ? "Video" : "Foto"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="truncate text-sm font-bold text-ink">{item.fileName}</h3>
                <p className="mt-1 text-sm text-neutral-500">Invitado: {item.guestName || "Sin nombre"}</p>
                <button className="btn-secondary mt-4 w-full py-2">Descargar archivo</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
