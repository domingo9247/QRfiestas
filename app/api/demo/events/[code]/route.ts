import { NextResponse } from "next/server";
import { deleteDemoServerEvent, getDemoServerEvent, saveDemoServerEvent } from "@/lib/demoServer";
import type { FiestaEvent } from "@/lib/types";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const eventItem = await getDemoServerEvent(code);

  if (!eventItem) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  return NextResponse.json(eventItem);
}

export async function PUT(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const current = await getDemoServerEvent(code);

  if (!current) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  const updates = (await request.json()) as Partial<FiestaEvent>;
  const updated = { ...current, ...updates };
  return NextResponse.json(await saveDemoServerEvent(updated));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await deleteDemoServerEvent(code);
  return NextResponse.json({ ok: true });
}
