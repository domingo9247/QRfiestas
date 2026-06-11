import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="gold-ring relative flex min-h-[92vh] items-center overflow-hidden px-6 py-16 text-white">
        <div className="absolute left-0 top-0 h-2 w-full confetti-band" />
        <div className="pointer-events-none absolute right-6 top-20 hidden rotate-6 rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-white/70 md:block">
          Fiesta en vivo
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ffcc5c]">Recuerdos privados por QR</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-7xl">QR Fiesta</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-100">
              Crea un evento, comparte un QR y recibe fotos y videos de tus invitados en una galeria alegre y facil de administrar.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/admin/login" className="btn-primary">
                Iniciar sesion
              </Link>
              <Link href="/cliente/login" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white hover:text-ink">
                Acceso cliente
              </Link>
              <a href="#experiencia" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white hover:text-ink">
                Ver experiencia
              </a>
            </div>
          </div>
          <div className="fiesta-card p-5 text-ink shadow-glow">
            <div className="rounded bg-[#151019] p-6 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#ffcc5c]">Boda A y V</span>
                <span className="rounded bg-[#25cdbe] px-3 py-1 text-xs font-black text-ink">ABCD1234</span>
              </div>
              <div className="mt-8 aspect-square rounded bg-white p-8">
                <div className="grid h-full grid-cols-5 gap-2">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={
                        index % 3 === 0
                          ? "rounded-sm bg-[#151019]"
                          : index % 5 === 0
                            ? "rounded-sm bg-[#ff5b87]"
                            : index % 7 === 0
                              ? "rounded-sm bg-[#25cdbe]"
                              : "rounded-sm bg-neutral-100"
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="mt-6 text-center text-sm text-neutral-200">Escanea, sube y vuelve a bailar.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="experiencia" className="mx-auto grid max-w-6xl gap-5 px-6 py-12 md:grid-cols-3">
        {[
          ["QR unico", "Cada evento tiene su propia liga para invitados."],
          ["Carga movil", "Fotos y videos desde el celular, sin instalar apps."],
          ["Galeria cliente", "El cliente puede entrar a revisar sus recuerdos."]
        ].map(([title, copy]) => (
          <article key={title} className="fiesta-card overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#ff5b87] via-[#ffcc5c] to-[#25cdbe]" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{copy}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
