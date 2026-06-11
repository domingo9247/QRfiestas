import { NextResponse } from "next/server";
import { listDemoEvents, saveDemoServerEvent } from "@/lib/demoServer";
import type { FiestaEvent } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await listDemoEvents());
}

export async function POST(request: Request) {
  const eventItem = (await request.json()) as FiestaEvent;
  return NextResponse.json(await saveDemoServerEvent(eventItem));
}
