"use client";

import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { FormEvent, useState } from "react";
import { db, createSecondaryAuth } from "@/lib/firebase";
import { isDemoAdminSession, saveDemoClient } from "@/lib/demoStore";
import type { ClientUser } from "@/lib/types";

type Props = {
  onCreated: (client: ClientUser) => void;
};

export function ClientUserForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (isDemoAdminSession()) {
      const client: ClientUser = {
        id: `demo-client-${Date.now()}`,
        uid: `demo-client-${Date.now()}`,
        name,
        email,
        password,
        role: "client"
      };

      saveDemoClient(client);
      onCreated(client);
      setName("");
      setEmail("");
      setPassword("");
      setMessage("Cliente demo creado. Ya puedes asignarle un evento.");
      setSaving(false);
      return;
    }

    const { secondaryAuth, dispose } = createSecondaryAuth();

    try {
      const result = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const client: ClientUser = {
        id: result.user.uid,
        uid: result.user.uid,
        name,
        email,
        role: "client"
      };

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        role: "client",
        createdAt: serverTimestamp()
      });

      await signOut(secondaryAuth);
      onCreated(client);
      setName("");
      setEmail("");
      setPassword("");
      setMessage("Cliente creado. Ya puedes asignarle un evento.");
    } catch {
      setMessage("No se pudo crear el cliente. Revisa email, contraseña o permisos de Firebase.");
    } finally {
      await dispose();
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="fiesta-card p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="label">Nombre del cliente</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required className="field" />
        </label>
        <label className="space-y-2">
          <span className="label">Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="field" />
        </label>
        <label className="space-y-2">
          <span className="label">Contraseña temporal</span>
          <input
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="field"
          />
        </label>
      </div>
      {message ? <p className="mt-4 text-sm font-semibold text-neutral-700">{message}</p> : null}
      <button disabled={saving} className="btn-primary mt-5 w-full md:w-auto">
        {saving ? "Creando cliente..." : "Crear cliente"}
      </button>
    </form>
  );
}
