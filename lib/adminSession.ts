"use client";

const ADMIN_SESSION_KEY = "qr-fiesta-admin-session";

export function startAdminSession() {
  window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
}

export function endAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function hasAdminSession() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}
