"use client";

import type { ClientUser, FiestaEvent, UploadItem } from "@/lib/types";

export const DEMO_ADMIN_EMAIL = "admin@qrfiesta.com";
export const DEMO_ADMIN_PASSWORD = "QRF!esta-Demo-2026";
export const DEMO_ADMIN_KEY = "qr-fiesta-demo-admin";
const DEMO_CLIENT_KEY = "qr-fiesta-demo-client";
const EVENTS_KEY = "qr-fiesta-demo-events";
const CLIENTS_KEY = "qr-fiesta-demo-clients";
const UPLOADS_KEY = "qr-fiesta-demo-uploads";

export function isLocalDemoHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.");
}

function readItems<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function writeItems<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function isDemoAdminSession() {
  if (typeof window === "undefined") return false;

  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && !isLocalDemoHost()) {
    return false;
  }

  return window.localStorage.getItem(DEMO_ADMIN_KEY) === "true";
}

export function startDemoAdminSession() {
  window.localStorage.setItem(DEMO_ADMIN_KEY, "true");
}

export function endDemoAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_ADMIN_KEY);
}

export function startDemoClientSession(uid: string) {
  window.localStorage.setItem(DEMO_CLIENT_KEY, uid);
}

export function getDemoClientSession() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(DEMO_CLIENT_KEY) || "";
}

export function endDemoClientSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_CLIENT_KEY);
}

export function getDemoClients() {
  return readItems<ClientUser>(CLIENTS_KEY);
}

export function saveDemoClient(client: ClientUser) {
  const clients = getDemoClients();
  writeItems(CLIENTS_KEY, [client, ...clients.filter((item) => item.uid !== client.uid)]);
}

export function deleteDemoClient(uid: string) {
  const clients = getDemoClients();
  writeItems(
    CLIENTS_KEY,
    clients.filter((client) => client.uid !== uid)
  );

  const events = getDemoEvents();
  writeItems(
    EVENTS_KEY,
    events.map((eventItem) =>
      eventItem.clientUid === uid
        ? { ...eventItem, clientUid: "", clientName: "", clientEmail: "", clientGalleryUrl: "" }
        : eventItem
    )
  );
}

export function getDemoEvents() {
  return readItems<FiestaEvent>(EVENTS_KEY);
}

export function saveDemoEvent(eventItem: FiestaEvent) {
  const events = getDemoEvents();
  writeItems(EVENTS_KEY, [eventItem, ...events.filter((item) => item.id !== eventItem.id)]);
}

export function updateDemoEvent(eventItem: FiestaEvent) {
  const events = getDemoEvents();
  writeItems(
    EVENTS_KEY,
    events.map((item) => (item.id === eventItem.id ? eventItem : item))
  );
}

export function deleteDemoEvent(code: string) {
  const events = getDemoEvents();
  writeItems(
    EVENTS_KEY,
    events.filter((eventItem) => eventItem.code !== code.toUpperCase())
  );
}

export function getDemoEventByCode(code: string) {
  return getDemoEvents().find((eventItem) => eventItem.code === code.toUpperCase()) ?? null;
}

export function getDemoUploadsByEventCode(code: string) {
  return readItems<UploadItem>(UPLOADS_KEY).filter((item) => item.eventCode === code.toUpperCase());
}
