import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getDemoEventByCode, getDemoUploadsByEventCode, isDemoAdminSession } from "@/lib/demoStore";
import { db, hasFirebaseConfig } from "@/lib/firebase";
import type { FiestaEvent, UploadItem } from "@/lib/types";

export const eventTypes = [
  { value: "boda", label: "Boda" },
  { value: "xv", label: "XV años" },
  { value: "cumpleanos", label: "Cumpleaños" },
  { value: "corporativo", label: "Corporativo" }
] as const;

export function generateEventCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || "";
}

export async function getEventByCode(code: string) {
  const normalizedCode = code.toUpperCase();

  if (isDemoAdminSession()) {
    const localEvent = getDemoEventByCode(normalizedCode);
    if (localEvent) return localEvent;
  }

  if (hasFirebaseConfig()) {
    try {
      const snap = await getDoc(doc(db, "events", normalizedCode));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as FiestaEvent;
    } catch {
      // Fall through to demo API for local/demo environments.
    }
  }

  const response = await fetch(`/api/demo/events/${normalizedCode}`);
  if (!response.ok) return null;
  return (await response.json()) as FiestaEvent;
}

export async function getUploadsByEventCode(code: string) {
  const normalizedCode = code.toUpperCase();

  if (isDemoAdminSession()) {
    const localUploads = getDemoUploadsByEventCode(normalizedCode);
    if (localUploads.length) return localUploads;
  }

  if (hasFirebaseConfig()) {
    try {
      const uploadsQuery = query(collection(db, "uploads"), where("eventCode", "==", normalizedCode));
      const snap = await getDocs(uploadsQuery);
      return snap.docs.map((uploadDoc) => ({ id: uploadDoc.id, ...uploadDoc.data() }) as UploadItem);
    } catch {
      // Fall through to demo API for local/demo environments.
    }
  }

  const response = await fetch(`/api/demo/uploads/${normalizedCode}`);
  if (!response.ok) return [];
  return (await response.json()) as UploadItem[];
}

export function formatEventType(value: string) {
  return eventTypes.find((item) => item.value === value)?.label ?? value;
}
