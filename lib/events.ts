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
  if (isDemoAdminSession()) {
    const localEvent = getDemoEventByCode(code);
    if (localEvent) return localEvent;
  }

  if (!hasFirebaseConfig()) {
    const response = await fetch(`/api/demo/events/${code.toUpperCase()}`);
    if (!response.ok) return null;
    return (await response.json()) as FiestaEvent;
  }

  const snap = await getDoc(doc(db, "events", code.toUpperCase()));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FiestaEvent;
}

export async function getUploadsByEventCode(code: string) {
  if (isDemoAdminSession()) {
    const localUploads = getDemoUploadsByEventCode(code);
    if (localUploads.length) return localUploads;
  }

  if (!hasFirebaseConfig()) {
    const response = await fetch(`/api/demo/uploads/${code.toUpperCase()}`);
    if (!response.ok) return [];
    return (await response.json()) as UploadItem[];
  }

  const uploadsQuery = query(collection(db, "uploads"), where("eventCode", "==", code));
  const snap = await getDocs(uploadsQuery);
  return snap.docs.map((uploadDoc) => ({ id: uploadDoc.id, ...uploadDoc.data() }) as UploadItem);
}

export function formatEventType(value: string) {
  return eventTypes.find((item) => item.value === value)?.label ?? value;
}
