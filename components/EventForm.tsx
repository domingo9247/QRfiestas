"use client";

import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isDemoAdminSession, saveDemoClient, saveDemoEvent } from "@/lib/demoStore";
import { eventTypes, generateEventCode, getBaseUrl } from "@/lib/events";
import { createSecondaryAuth, db } from "@/lib/firebase";
import type { ClientUser, EventType } from "@/lib/types";

export function EventForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<EventType>("boda");
  const [photoLimit, setPhotoLimit] = useState(250);
  const [active, setActive] = useState(true);
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const code = generateEventCode();
      const baseUrl = getBaseUrl();
      const publicUrl = `${baseUrl}/e/${code}`;
      const clientGalleryUrl = `${baseUrl}/cliente/events/${code}`;
      const clientName = name;
      let clientUid = `event-client-${code}`;

      if (isDemoAdminSession()) {
        const demoClient: ClientUser = {
          id: clientUid,
          uid: clientUid,
          name: clientName,
          email: clientEmail,
          password: clientPassword,
          role: "client"
        };

        const demoEvent = {
          id: code,
          code,
          name,
          date,
          type,
          photoLimit: Number(photoLimit),
          active,
          publicUrl,
          clientGalleryUrl,
          clientUid,
          clientName,
          clientEmail,
          clientPassword
        };

        saveDemoClient(demoClient);
        saveDemoEvent(demoEvent);
        await fetch("/api/demo/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(demoEvent)
        });
        router.push(`/admin/events/${code}`);
        return;
      }

      const { secondaryAuth, dispose } = createSecondaryAuth();
      try {
        const result = await createUserWithEmailAndPassword(secondaryAuth, clientEmail, clientPassword);
        clientUid = result.user.uid;
        await setDoc(doc(db, "users", clientUid), {
          uid: clientUid,
          name: clientName,
          email: clientEmail,
          role: "client",
          createdAt: serverTimestamp()
        });
        await signOut(secondaryAuth);
      } finally {
        await dispose();
      }

      await setDoc(doc(db, "events", code), {
        code,
        name,
        date,
        type,
        photoLimit: Number(photoLimit),
        active,
        publicUrl,
        clientGalleryUrl,
        clientUid,
        clientName,
        clientEmail,
        clientPassword,
        createdAt: serverTimestamp()
      });

      router.push(`/admin/events/${code}`);
    } catch (createError) {
      if (createError instanceof FirebaseError) {
        if (createError.code === "auth/email-already-in-use") {
          setError("Ese email ya existe en Firebase Auth. Usa otro email para este evento o borra el usuario anterior.");
        } else if (createError.code === "auth/weak-password") {
          setError("La contrasena del cliente debe tener al menos 6 caracteres.");
        } else {
          setError(`Firebase: ${createError.code}`);
        }
      } else {
        setError("No se pudo crear el evento. Revisa el email, contrasena o permisos de Firebase.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="fiesta-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="label">Nombre del evento</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Boda A y V"
            className="field"
          />
        </label>
        <label className="space-y-2">
          <span className="label">Fecha</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="field" />
        </label>
        <label className="space-y-2">
          <span className="label">Tipo</span>
          <select value={type} onChange={(event) => setType(event.target.value as EventType)} className="field">
            {eventTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="label">Limite de fotos/videos</span>
          <input
            type="number"
            min={1}
            value={photoLimit}
            onChange={(event) => setPhotoLimit(Number(event.target.value))}
            required
            className="field"
          />
        </label>
        <label className="flex items-center gap-3 rounded border border-neutral-200 px-4 py-3">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          <span className="text-sm font-semibold text-ink">Evento activo</span>
        </label>
        <label className="space-y-2">
          <span className="label">Email del cliente</span>
          <input
            type="email"
            value={clientEmail}
            onChange={(event) => setClientEmail(event.target.value)}
            required
            className="field"
          />
        </label>
        <label className="space-y-2">
          <span className="label">Contrasena del cliente</span>
          <input
            type="password"
            minLength={6}
            value={clientPassword}
            onChange={(event) => setClientPassword(event.target.value)}
            required
            className="field"
          />
        </label>
      </div>
      <p className="mt-4 text-sm text-neutral-500">
        Este acceso sera para que el cliente vea la galeria privada de este evento.
      </p>
      {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
      <button disabled={saving} className="btn-primary mt-5 w-full md:w-auto">
        {saving ? "Creando..." : "Crear evento y acceso"}
      </button>
    </form>
  );
}
