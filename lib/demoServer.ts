import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { ClientUser, FiestaEvent, UploadItem } from "@/lib/types";

type DemoDb = {
  clients: ClientUser[];
  events: FiestaEvent[];
  uploads: UploadItem[];
};

const dbPath = path.join(process.cwd(), ".demo", "db.json");

async function readDb(): Promise<DemoDb> {
  try {
    const contents = await readFile(dbPath, "utf8");
    return JSON.parse(contents) as DemoDb;
  } catch {
    return { clients: [], events: [], uploads: [] };
  }
}

async function writeDb(db: DemoDb) {
  await mkdir(path.dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export async function listDemoEvents() {
  return (await readDb()).events;
}

export async function getDemoServerEvent(code: string) {
  return (await readDb()).events.find((eventItem) => eventItem.code === code.toUpperCase()) ?? null;
}

export async function saveDemoServerEvent(eventItem: FiestaEvent) {
  const db = await readDb();
  db.events = [eventItem, ...db.events.filter((item) => item.id !== eventItem.id)];
  await writeDb(db);
  return eventItem;
}

export async function deleteDemoServerEvent(code: string) {
  const db = await readDb();
  db.events = db.events.filter((eventItem) => eventItem.code !== code.toUpperCase());
  db.uploads = db.uploads.filter((upload) => upload.eventCode !== code.toUpperCase());
  await writeDb(db);
}

export async function listDemoUploads(eventCode: string) {
  return (await readDb()).uploads.filter((upload) => upload.eventCode === eventCode.toUpperCase());
}

export async function saveDemoUpload(upload: UploadItem) {
  const db = await readDb();
  db.uploads = [upload, ...db.uploads];
  await writeDb(db);
  return upload;
}
