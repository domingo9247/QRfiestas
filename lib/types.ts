import type { Timestamp } from "firebase/firestore";

export type EventType = "boda" | "xv" | "cumpleanos" | "corporativo";

export type FiestaEvent = {
  id: string;
  code: string;
  name: string;
  date: string;
  type: EventType;
  photoLimit: number;
  active: boolean;
  publicUrl: string;
  clientUid?: string;
  clientName?: string;
  clientEmail?: string;
  clientPassword?: string;
  clientGalleryUrl?: string;
  createdAt?: Timestamp;
};

export type ClientUser = {
  id: string;
  uid: string;
  name: string;
  email: string;
  password?: string;
  role: "client" | "admin";
  createdAt?: Timestamp;
};

export type UploadItem = {
  id: string;
  eventCode: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  guestName: string;
  createdAt?: Timestamp;
};
