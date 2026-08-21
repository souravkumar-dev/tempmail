export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { generateEmail } from "@/lib/guerrilla-api";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/accounts");

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    log.info("Generating new email account");
    const session = await generateEmail();
    log.info("Generated email", { email: session.email, duration: Date.now() - start });
    return NextResponse.json(session);
  } catch (err: any) {
    log.error("Failed to create email", { error: err.message, duration: Date.now() - start });
    return NextResponse.json(
      { error: "Failed to create email", detail: err.message },
      { status: 500 }
    );
  }
}
