import { NextRequest, NextResponse } from "next/server";
import { submitResponses } from "@/lib/formSubmitter";
import type { SubmitRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitRequest;
    const { submitUrl, responses, delayMs } = body;

    if (!submitUrl || typeof submitUrl !== "string") {
      return NextResponse.json(
        { error: "submitUrl is required." },
        { status: 400 }
      );
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: "At least one response is required." },
        { status: 400 }
      );
    }

    if (responses.length > 1000) {
      return NextResponse.json(
        { error: "Maximum 1000 responses per request." },
        { status: 400 }
      );
    }

    const result = await submitResponses(submitUrl, responses, delayMs ?? 500);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit responses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
