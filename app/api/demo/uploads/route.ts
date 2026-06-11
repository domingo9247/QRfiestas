import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getDemoServerEvent, saveDemoUpload } from "@/lib/demoServer";
import type { UploadItem } from "@/lib/types";

const allowedExtensions = ["jpg", "jpeg", "png", "heic", "mp4", "mov"];
const maxFileSize = 100 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const eventCode = String(formData.get("eventCode") || "").toUpperCase();
  const guestName = String(formData.get("guestName") || "");
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);
  const eventItem = await getDemoServerEvent(eventCode);

  if (!eventItem || !eventItem.active) {
    return NextResponse.json({ error: "Evento no activo" }, { status: 400 });
  }

  const uploads: UploadItem[] = [];
  const uploadDir = path.join(process.cwd(), "public", "demo-uploads", eventCode);
  await mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!allowedExtensions.includes(extension) || file.size > maxFileSize) {
      return NextResponse.json({ error: "Archivo no permitido" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storedName = `${Date.now()}-${safeName}`;
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, storedName), Buffer.from(arrayBuffer));

    const upload: UploadItem = {
      id: `${eventCode}-${storedName}`,
      eventCode,
      fileName: file.name,
      fileUrl: `/demo-uploads/${eventCode}/${storedName}`,
      fileType: file.type || extension,
      guestName
    };

    await saveDemoUpload(upload);
    uploads.push(upload);
  }

  return NextResponse.json(uploads);
}
