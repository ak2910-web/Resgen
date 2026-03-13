import type {
  FormField,
  GeneratedResponse,
  ResponseMode,
} from "./types";

// ---------------------------------------------------------------------------
// Random helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const RANDOM_SHORT_ANSWERS = [
  "Yes",
  "No",
  "Maybe",
  "Definitely",
  "Not sure",
  "Absolutely",
  "It depends",
  "Of course",
  "Never",
  "Sometimes",
];

const RANDOM_PARAGRAPHS = [
  "I think this is a great initiative and I support it fully.",
  "There are many factors to consider here, and I believe the approach is sound.",
  "In my experience, this works well when implemented correctly.",
  "I would recommend taking a closer look at the details before deciding.",
  "Overall, I am satisfied with the current state of things.",
  "This has been a positive experience and I look forward to seeing the results.",
  "The process could be improved, but it is generally effective.",
  "I appreciate the effort that has gone into making this work.",
];

const RANDOM_NAMES = [
  "Alex Johnson",
  "Sam Williams",
  "Jordan Brown",
  "Taylor Davis",
  "Morgan Wilson",
  "Casey Miller",
  "Riley Moore",
  "Avery Taylor",
  "Blake Anderson",
  "Cameron Thomas",
];

const RANDOM_EMAILS = [
  "user@example.com",
  "test@sample.org",
  "respondent@mail.com",
  "participant@domain.net",
  "member@site.io",
];

function randomDateString(): string {
  const year = randomInt(2020, 2025);
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function randomTimeString(): string {
  const hour = String(randomInt(0, 23)).padStart(2, "0");
  const minute = String(randomInt(0, 59)).padStart(2, "0");
  return `${hour}:${minute}`;
}

/**
 * Generate a single random answer for a given form field.
 */
function randomAnswer(field: FormField): string | string[] {
  switch (field.type) {
    case "multiple_choice":
    case "dropdown":
      if (field.options && field.options.length > 0) {
        return randomChoice(field.options);
      }
      return randomChoice(RANDOM_SHORT_ANSWERS);

    case "checkboxes":
      if (field.options && field.options.length > 0) {
        // Pick 1–3 options at random
        const count = randomInt(1, Math.min(3, field.options.length));
        const shuffled = [...field.options].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      }
      return [randomChoice(RANDOM_SHORT_ANSWERS)];

    case "paragraph":
      return randomChoice(RANDOM_PARAGRAPHS);

    case "linear_scale": {
      const min = field.scaleMin ?? 1;
      const max = field.scaleMax ?? 5;
      return String(randomInt(min, max));
    }

    case "date":
      return randomDateString();

    case "time":
      return randomTimeString();

    case "short_answer":
    default: {
      // Heuristic: guess the field intent from the question text
      const q = field.question.toLowerCase();
      if (q.includes("name")) return randomChoice(RANDOM_NAMES);
      if (q.includes("email")) return randomChoice(RANDOM_EMAILS);
      if (q.includes("age")) return String(randomInt(18, 65));
      if (q.includes("phone") || q.includes("mobile")) {
        return `+1${randomInt(2000000000, 9999999999)}`;
      }
      return randomChoice(RANDOM_SHORT_ANSWERS);
    }
  }
}

// ---------------------------------------------------------------------------
// Random mode
// ---------------------------------------------------------------------------

export function generateRandomResponses(
  fields: FormField[],
  count: number
): GeneratedResponse[] {
  return Array.from({ length: count }, () => {
    const entries: Record<string, string | string[]> = {};
    for (const field of fields) {
      entries[`entry.${field.entryId}`] = randomAnswer(field);
    }
    return { entries };
  });
}

// ---------------------------------------------------------------------------
// CSV mode
// ---------------------------------------------------------------------------

/**
 * Maps CSV column headers to form fields using case-insensitive partial
 * matching against the field question text, then generates one response per
 * CSV row (cycling through rows if count > rows.length).
 */
export function generateCsvResponses(
  fields: FormField[],
  count: number,
  csvData: Record<string, string>[]
): GeneratedResponse[] {
  if (csvData.length === 0) {
    return generateRandomResponses(fields, count);
  }

  const responses: GeneratedResponse[] = [];

  for (let i = 0; i < count; i++) {
    const row = csvData[i % csvData.length];
    const entries: Record<string, string | string[]> = {};

    for (const field of fields) {
      // Try to find a matching CSV column for this field
      const questionLower = field.question.toLowerCase();
      let matched = false;

      for (const [col, val] of Object.entries(row)) {
        if (questionLower.includes(col.toLowerCase()) || col.toLowerCase().includes(questionLower)) {
          entries[`entry.${field.entryId}`] = val;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Fall back to random
        entries[`entry.${field.entryId}`] = randomAnswer(field);
      }
    }

    responses.push({ entries });
  }

  return responses;
}

// ---------------------------------------------------------------------------
// AI mode
// ---------------------------------------------------------------------------

/**
 * Generate AI-powered responses via OpenAI.
 * Falls back to random if the API key is not configured.
 */
export async function generateAiResponses(
  fields: FormField[],
  count: number
): Promise<GeneratedResponse[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // No API key — fall back to random
    return generateRandomResponses(fields, count);
  }

  // Build a prompt that describes all the fields
  const fieldDescriptions = fields
    .map(
      (f, idx) =>
        `${idx + 1}. [${f.type}] ${f.question}${
          f.options ? ` (options: ${f.options.join(", ")})` : ""
        }${f.type === "linear_scale" ? ` (scale ${f.scaleMin}–${f.scaleMax})` : ""}`
    )
    .join("\n");

  const prompt = `You are generating realistic survey responses for a Google Form.

Form fields:
${fieldDescriptions}

Generate ${count} separate, realistic responses. Return a JSON array with ${count} objects.
Each object should have keys that are the field question text (exactly as written) and values that are the answer.
For checkboxes, provide an array of selected options.
For multiple choice and dropdowns, pick exactly one from the given options.
For linear scale, return a number within the valid range.
For date fields, return a date in YYYY-MM-DD format.
For time fields, return a time in HH:MM format.
Return ONLY valid JSON, no additional text.`;

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const content = completion.choices[0]?.message?.content ?? "[]";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiAnswers: Record<string, any>[] = JSON.parse(content);

    return aiAnswers.map((answerMap) => {
      const entries: Record<string, string | string[]> = {};
      for (const field of fields) {
        const aiValue = answerMap[field.question];
        if (aiValue !== undefined) {
          entries[`entry.${field.entryId}`] = Array.isArray(aiValue)
            ? (aiValue as string[]).map(String)
            : String(aiValue);
        } else {
          entries[`entry.${field.entryId}`] = randomAnswer(field);
        }
      }
      return { entries };
    });
  } catch {
    // If AI fails, fall back to random
    return generateRandomResponses(fields, count);
  }
}
