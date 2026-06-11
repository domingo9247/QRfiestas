"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { FormEvent, useMemo, useState } from "react";
import { db, hasFirebaseStorageConfig, storage } from "@/lib/firebase";
import { validateUploadFile } from "@/lib/uploads";
import type { FiestaEvent } from "@/lib/types";

export function UploadForm({ eventData }: { eventData: FiestaEvent }) {
  const [guestName, setGuestName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileNames = useMemo(() => files.map((file) => file.name).join(", "), [files]);

  async function uploadSingleFile(file: File, index: number) {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storageRef = ref(storage, `events/${eventData.code}/uploads/${timestamp}-${safeName}`);
    const task = uploadBytesResumable(storageRef, file);

    await new Promise<void>((resolve, reject) => {
      task.on(
        "state_changed",
        (snapshot) => {
          const fileProgress = snapshot.bytesTransferred / snapshot.totalBytes;
          setProgress(Math.round(((index + fileProgress) / files.length) * 100));
        },
        reject,
        () => resolve()
      );
    });

    const fileUrl = await getDownloadURL(task.snapshot.ref);
    await addDoc(collection(db, "uploads"), {
      eventCode: eventData.code,
      fileName: file.name,
      fileUrl,
      fileType: file.type || file.name.split(".").pop()?.toLowerCase() || "archivo",
      guestName: guestName.trim(),
      createdAt: serverTimestamp()
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!eventData.active) {
      setStatus("Este evento no está activo para recibir archivos.");
      return;
    }

    if (!files.length) {
      setStatus("Selecciona al menos un archivo.");
      return;
    }

    const validationError = files.map(validateUploadFile).find(Boolean);
    if (validationError) {
      setStatus(validationError);
      return;
    }

    if (files.length > eventData.photoLimit) {
      setStatus(`Puedes subir máximo ${eventData.photoLimit} archivos en este evento.`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      if (!hasFirebaseStorageConfig()) {
        const formData = new FormData();
        formData.append("eventCode", eventData.code);
        formData.append("guestName", guestName.trim());
        files.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/demo/uploads", {
          method: "POST",
          body: formData
        });

        if (!response.ok) throw new Error("Demo upload failed");

        setFiles([]);
        setProgress(100);
        setStatus("Listo. Tus recuerdos ya estan guardados para el evento.");
        return;
      }

      for (let index = 0; index < files.length; index += 1) {
        await uploadSingleFile(files[index], index);
      }
      setFiles([]);
      setProgress(100);
      setStatus("Listo. Tus recuerdos ya están guardados para el evento.");
    } catch {
      setStatus("No se pudo completar la subida. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl rounded border border-neutral-200 bg-white p-5 shadow-glow">
      <label className="space-y-2">
        <span className="label">Tu nombre opcional</span>
        <input
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="Ej. Mariana"
          className="field"
        />
      </label>
      <label className="mt-4 block space-y-2">
        <span className="label">Fotos y videos</span>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.heic,.mp4,.mov,image/jpeg,image/png,image/heic,video/mp4,video/quicktime"
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          className="field file:mr-4 file:rounded file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </label>
      {fileNames ? <p className="mt-3 break-words text-sm text-neutral-500">{fileNames}</p> : null}
      {uploading ? (
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full bg-champagne transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-neutral-600">{progress}%</p>
        </div>
      ) : null}
      {status ? <p className="mt-4 text-sm font-semibold text-neutral-800">{status}</p> : null}
      <button disabled={uploading || !eventData.active} className="btn-primary mt-5 w-full">
        {uploading ? "Subiendo..." : "Subir recuerdos"}
      </button>
    </form>
  );
}
