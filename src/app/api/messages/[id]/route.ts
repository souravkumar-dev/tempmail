export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getMessage } from "@/lib/guerrilla-api";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/message");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  try {
    const sid = req.headers.get("x-sid-token");
    if (!sid || sid.length < 10 || sid.length > 100) {
      return NextResponse.json({ error: "Invalid or missing session token" }, { status: 401 });
    }

    const { id } = await params;

    // Validate message ID format (Guerrilla Mail IDs are alphanumeric)
    if (!id || id.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    const message = await getMessage(sid, id);
    log.info("Fetched message", { id, duration: Date.now() - start });
    return NextResponse.json(message);
  } catch (err: any) {
    log.error("Failed to fetch message", { error: err.message, duration: Date.now() - start });
    return NextResponse.json(
      { error: "Failed to fetch message", detail: err.message },
      { status: 500 }
    );
  }
}
