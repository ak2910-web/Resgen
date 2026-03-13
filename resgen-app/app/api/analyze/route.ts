import { NextRequest, NextResponse } from "next/server";
import { analyzeForm } from "@/lib/formAnalyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A Google Form URL is required." },
        { status: 400 }
      );
    }

    // Basic validation — must look like a Google Forms URL
    const urlPattern =
      /^https:\/\/docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]+\/(viewform|formResponse)/;
    if (!urlPattern.test(url)) {
      return NextResponse.json(
        {
          error:
            "Invalid Google Forms URL. Expected format: https://docs.google.com/forms/d/e/<FORM_ID>/viewform",
        },
        { status: 400 }
      );
    }

    const result = await analyzeForm(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze form";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
