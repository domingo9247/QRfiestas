"use client";

const CLIENT_SESSION_KEY = "qr-fiesta-client-session";

export function startClientSession(uid: string) {
  window.localStorage.setItem(CLIENT_SESSION_KEY, uid);
}

export function getClientSession() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CLIENT_SESSION_KEY) || "";
}

export function endClientSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CLIENT_SESSION_KEY);
}
