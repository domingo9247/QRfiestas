"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, isLocalDemoHost, startDemoAdminSession } from "@/lib/demoStore";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [demoEnabled] = useState(() => isLocalDemoHost());
  const [email, setEmail] = useState(() => (isLocalDemoHost() ? DEMO_ADMIN_EMAIL : ""));
  const [password, setPassword] = useState(() => (isLocalDemoHost() ? DEMO_ADMIN_PASSWORD : ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (demoEnabled && email.trim().toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      startDemoAdminSession();
      router.push("/admin");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/admin");
    } catch {
      setError("Email o contrasena incorrectos.");
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
        <h1 className="mt-5 text-3xl font-black text-ink">Acceso admin</h1>
        <p className="mt-2 text-sm text-neutral-500">Entra para crear eventos, clientes y QR.</p>
        {demoEnabled ? (
          <div className="mt-5 rounded bg-neutral-50 p-4 text-sm text-neutral-700">
            <p className="font-bold text-ink">Usuario demo local</p>
            <p>Email: {DEMO_ADMIN_EMAIL}</p>
            <p>Contrasena: {DEMO_ADMIN_PASSWORD}</p>
          </div>
        ) : null}
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
          {loading ? "Entrando..." : "Iniciar sesion"}
        </button>
      </form>
    </main>
  );
}
