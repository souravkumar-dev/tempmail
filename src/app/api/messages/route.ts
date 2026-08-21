export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/guerrilla-api";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/messages");

export async function GET(req: NextRequest) {
  const start = Date.now();
  try {
    const sid = req.headers.get("x-sid-token");
    if (!sid || sid.length < 10 || sid.length > 100) {
      return NextResponse.json({ error: "Invalid or missing session token" }, { status: 401 });
    }

    const messages = await getMessages(sid);
    log.info("Fetched messages", { count: messages.length, duration: Date.now() - start });
    return NextResponse.json({ messages });
  } catch (err: any) {
    log.error("Failed to fetch messages", { error: err.message, duration: Date.now() - start });
    return NextResponse.json(
      { error: "Failed to fetch messages", detail: err.message },
      { status: 500 }
    );
  }
}
