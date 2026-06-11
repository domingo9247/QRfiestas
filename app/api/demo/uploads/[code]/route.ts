import { NextResponse } from "next/server";
import { listDemoUploads } from "@/lib/demoServer";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return NextResponse.json(await listDemoUploads(code));
}
