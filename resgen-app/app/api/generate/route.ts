import { NextRequest, NextResponse } from "next/server";
import {
  generateRandomResponses,
  generateCsvResponses,
  generateAiResponses,
} from "@/lib/responseGenerator";
import type { GenerateRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;

    const { fields, mode, count, csvData, fieldWeights } = body;

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: "Form fields are required." },
        { status: 400 }
      );
    }

    if (!count || count < 1 || count > 1000) {
      return NextResponse.json(
        { error: "Response count must be between 1 and 1000." },
        { status: 400 }
      );
    }

    let responses;

    switch (mode) {
      case "random":
        responses = generateRandomResponses(fields, count, fieldWeights);
        break;

      case "csv":
        if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
          return NextResponse.json(
            { error: "CSV data is required for CSV mode." },
            { status: 400 }
          );
        }
        responses = generateCsvResponses(fields, count, csvData, fieldWeights);
        break;

      case "ai":
        responses = await generateAiResponses(fields, count, fieldWeights);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid mode. Use 'random', 'ai', or 'csv'." },
          { status: 400 }
        );
    }

    return NextResponse.json({ responses });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate responses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
