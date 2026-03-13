import type {
  FormField,
  GeneratedResponse,
  SyntheticProfile,
  OptionWeights,
} from "./types";
import { getProfile, SYNTHETIC_PROFILES } from "./syntheticProfiles";

// ---------------------------------------------------------------------------
// Weighted random selection
// ---------------------------------------------------------------------------

/**
 * Picks an item from `items` according to the provided weight map.
 * Items not in the map get a default weight of 1.
 */
function weightedChoice(items: string[], weights?: OptionWeights): string {
  if (!weights || Object.keys(weights).length === 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  const totalWeight = items.reduce((sum, item) => sum + (weights[item] ?? 1), 0);
  let rand = Math.random() * totalWeight;

  for (const item of items) {
    rand -= weights[item] ?? 1;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

// ---------------------------------------------------------------------------
// Pure random helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const RANDOM_SHORT_ANSWERS = [
  "Yes", "No", "Maybe", "Definitely", "Not sure",
  "Absolutely", "It depends", "Of course", "Never", "Sometimes",
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

// ---------------------------------------------------------------------------
// Profile-aware answer generators
// ---------------------------------------------------------------------------

/**
 * Returns a short-answer value that respects the user profile when the
 * question text suggests a personal detail (name, email, age, etc.).
 */
function profileAnswer(field: FormField, profile?: SyntheticProfile): string {
  if (!profile) {
    const q = field.question.toLowerCase();
    if (q.includes("name")) return randomChoice(SYNTHETIC_PROFILES.map((p) => p.name));
    if (q.includes("email")) return randomChoice(SYNTHETIC_PROFILES.map((p) => p.email));
    if (q.includes("age")) return String(randomInt(18, 65));
    if (q.includes("phone") || q.includes("mobile"))
      return `+1${randomInt(2000000000, 9999999999)}`;
    return randomChoice(RANDOM_SHORT_ANSWERS);
  }

  const q = field.question.toLowerCase();
  if (q.includes("name")) return profile.name;
  if (q.includes("email")) return profile.email;
  if (q.includes("age")) return String(profile.age);
  if (q.includes("gender")) return profile.gender;
  if (q.includes("occupation") || q.includes("job") || q.includes("profession"))
    return profile.occupation;
  if (q.includes("education") || q.includes("qualification"))
    return profile.education;
  if (q.includes("location") || q.includes("city") || q.includes("country"))
    return profile.location;
  if (q.includes("phone") || q.includes("mobile"))
    return `+1${randomInt(2000000000, 9999999999)}`;

  return randomChoice(RANDOM_SHORT_ANSWERS);
}

/**
 * Generates a single answer for a form field, respecting profile details and
 * optional MCQ weights.
 */
function generateAnswer(
  field: FormField,
  profile?: SyntheticProfile,
  weights?: OptionWeights
): string | string[] {
  switch (field.type) {
    case "multiple_choice":
    case "dropdown":
      if (field.options && field.options.length > 0) {
        return weightedChoice(field.options, weights);
      }
      return randomChoice(RANDOM_SHORT_ANSWERS);

    case "checkboxes":
      if (field.options && field.options.length > 0) {
        const count = randomInt(1, Math.min(3, field.options.length));
        // Apply weights by sorting with weighted probability
        const sorted = field.options
          .map((opt) => ({ opt, w: weights?.[opt] ?? 1 }))
          .sort((a, b) => b.w * Math.random() - a.w * Math.random());
        return sorted.slice(0, count).map((x) => x.opt);
      }
      return [randomChoice(RANDOM_SHORT_ANSWERS)];

    case "paragraph":
      return randomChoice(RANDOM_PARAGRAPHS);

    case "linear_scale": {
      const min = field.scaleMin ?? 1;
      const max = field.scaleMax ?? 5;
      const scaleOptions = Array.from({ length: max - min + 1 }, (_, i) =>
        String(min + i)
      );
      if (weights && Object.keys(weights).length > 0) {
        return weightedChoice(scaleOptions, weights);
      }
      // Default: realistic bell-curve-ish distribution skewing positive
      const defaultWeights: OptionWeights = {};
      scaleOptions.forEach((opt, idx) => {
        const pos = idx / (scaleOptions.length - 1); // 0 → 1
        defaultWeights[opt] = Math.round(5 + pos * 15); // 5 to 20
      });
      return weightedChoice(scaleOptions, defaultWeights);
    }

    case "date":
      return randomDateString();

    case "time":
      return randomTimeString();

    case "short_answer":
    default:
      return profileAnswer(field, profile);
  }
}

// ---------------------------------------------------------------------------
// Random mode
// ---------------------------------------------------------------------------

export function generateRandomResponses(
  fields: FormField[],
  count: number,
  fieldWeights?: Record<string, OptionWeights>
): GeneratedResponse[] {
  return Array.from({ length: count }, (_, i) => {
    const profile = getProfile(i);
    const entries: Record<string, string | string[]> = {};

    for (const field of fields) {
      entries[`entry.${field.entryId}`] = generateAnswer(
        field,
        profile,
        fieldWeights?.[field.entryId]
      );
    }

    return {
      entries,
      profile: { id: profile.id, name: profile.name, age: profile.age, occupation: profile.occupation },
    };
  });
}

// ---------------------------------------------------------------------------
// CSV mode
// ---------------------------------------------------------------------------

export function generateCsvResponses(
  fields: FormField[],
  count: number,
  csvData: Record<string, string>[],
  fieldWeights?: Record<string, OptionWeights>
): GeneratedResponse[] {
  if (csvData.length === 0) {
    return generateRandomResponses(fields, count, fieldWeights);
  }

  const responses: GeneratedResponse[] = [];

  for (let i = 0; i < count; i++) {
    const row = csvData[i % csvData.length];
    const profile = getProfile(i);
    const entries: Record<string, string | string[]> = {};

    for (const field of fields) {
      const questionLower = field.question.toLowerCase();
      let matched = false;

      for (const [col, val] of Object.entries(row)) {
        if (
          questionLower.includes(col.toLowerCase()) ||
          col.toLowerCase().includes(questionLower)
        ) {
          entries[`entry.${field.entryId}`] = val;
          matched = true;
          break;
        }
      }

      if (!matched) {
        entries[`entry.${field.entryId}`] = generateAnswer(
          field,
          profile,
          fieldWeights?.[field.entryId]
        );
      }
    }

    responses.push({
      entries,
      profile: { id: profile.id, name: profile.name, age: profile.age, occupation: profile.occupation },
    });
  }

  return responses;
}

// ---------------------------------------------------------------------------
// AI mode — profile-aware prompts
// ---------------------------------------------------------------------------

export async function generateAiResponses(
  fields: FormField[],
  count: number,
  fieldWeights?: Record<string, OptionWeights>
): Promise<GeneratedResponse[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return generateRandomResponses(fields, count, fieldWeights);
  }

  const fieldDescriptions = fields
    .map(
      (f, idx) =>
        `${idx + 1}. [${f.type}] ${f.question}` +
        (f.options ? ` (options: ${f.options.join(", ")})` : "") +
        (f.type === "linear_scale"
          ? ` (scale ${f.scaleMin ?? 1}–${f.scaleMax ?? 5})`
          : "")
    )
    .join("\n");

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
  const responses: GeneratedResponse[] = [];

  for (let i = 0; i < count; i++) {
    const profile = getProfile(i);

    const prompt = `You are simulating a realistic survey response for form testing purposes.

Respondent profile:
- Name: ${profile.name}
- Age: ${profile.age}
- Occupation: ${profile.occupation}
- Education: ${profile.education}
- Location: ${profile.location}
- Gender: ${profile.gender}

Form fields:
${fieldDescriptions}

Generate ONE realistic response as this respondent. Return a JSON object where keys are the exact field question text and values are the answer.
Rules:
- For multiple_choice / dropdown: pick exactly one option from the list provided.
- For checkboxes: return an array of 1–3 selected options from the list.
- For linear_scale: return a number within the valid range as a string.
- For date: return YYYY-MM-DD format.
- For time: return HH:MM format.
- For name/email/age fields: use the respondent profile details above.
- For open-ended questions: write a realistic answer matching the respondent's profile.
Return ONLY valid JSON, no extra text.`;

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
      });

      const content = completion.choices[0]?.message?.content ?? "{}";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const answerMap: Record<string, any> = JSON.parse(content);

      const entries: Record<string, string | string[]> = {};
      for (const field of fields) {
        const aiValue = answerMap[field.question];
        if (aiValue !== undefined && aiValue !== null) {
          entries[`entry.${field.entryId}`] = Array.isArray(aiValue)
            ? (aiValue as string[]).map(String)
            : String(aiValue);
        } else {
          entries[`entry.${field.entryId}`] = generateAnswer(
            field,
            profile,
            fieldWeights?.[field.entryId]
          );
        }
      }

      responses.push({
        entries,
        profile: { id: profile.id, name: profile.name, age: profile.age, occupation: profile.occupation },
      });
    } catch {
      // Fall back to random for this individual response
      const entries: Record<string, string | string[]> = {};
      for (const field of fields) {
        entries[`entry.${field.entryId}`] = generateAnswer(
          field,
          profile,
          fieldWeights?.[field.entryId]
        );
      }
      responses.push({
        entries,
        profile: { id: profile.id, name: profile.name, age: profile.age, occupation: profile.occupation },
      });
    }
  }

  return responses;
}
