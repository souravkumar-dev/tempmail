export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDomains } from "@/lib/guerrilla-api";

export async function GET() {
  try {
    const domains = await getDomains();
    return NextResponse.json({ domains });
  } catch (err: any) {
    console.error("[domains] ERROR:", err?.message);
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }
}
