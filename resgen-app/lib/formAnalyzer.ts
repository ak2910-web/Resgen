import { chromium } from "playwright";
import type { AnalyzeResponse, FormField, FieldType } from "./types";

/**
 * Maps the Google Forms internal type number to our FieldType.
 * Reference: https://developers.google.com/forms (internal FB_ constants).
 */
function mapGoogleFieldType(typeCode: number): FieldType {
  switch (typeCode) {
    case 0:
      return "short_answer";
    case 1:
      return "paragraph";
    case 2:
      return "multiple_choice";
    case 3:
      return "checkboxes";
    case 4:
      return "dropdown";
    case 5:
      return "linear_scale";
    case 9:
      return "date";
    case 10:
      return "time";
    default:
      return "short_answer";
  }
}

/**
 * Converts a Google Form "viewform" URL to the corresponding "formResponse"
 * (submission) URL, normalising various formats along the way.
 */
export function buildSubmitUrl(formUrl: string): string {
  // Strip query string / fragment
  const base = formUrl.split("?")[0].split("#")[0];
  // Replace /viewform (or trailing slash) with /formResponse
  return base.replace(/\/viewform\/?$/, "/formResponse").replace(/\/$/, "") + "/formResponse";
}

/**
 * Fetches and parses a Google Form, returning its title, fields, and the
 * submission URL.
 *
 * Google Forms embeds form data as a JSON literal inside the page HTML in a
 * variable called `FB_PUBLIC_LOAD_DATA_`.  We extract that blob with a simple
 * regex and parse the well-known structure.
 */
export async function analyzeForm(formUrl: string): Promise<AnalyzeResponse> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Navigate to the form
    await page.goto(formUrl, { waitUntil: "networkidle", timeout: 30000 });

    // Extract the FB_PUBLIC_LOAD_DATA_ variable from the page source
    const rawData: string | null = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script"));
      for (const s of scripts) {
        const text = s.textContent ?? "";
        if (text.includes("FB_PUBLIC_LOAD_DATA_")) {
          return text;
        }
      }
      return null;
    });

    if (!rawData) {
      throw new Error(
        "Could not find form data. Make sure the link points to a public Google Form."
      );
    }

    // Extract the array literal assigned to FB_PUBLIC_LOAD_DATA_
    const match = rawData.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*;/);
    if (!match) {
      throw new Error("Could not parse form data structure.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = JSON.parse(match[1]);

    // The structure is:
    //   data[1][1]  -> array of field descriptors
    //   data[1][8]  -> form title (index 0) and description (index 1)
    const formMeta = data[1][8];
    const formTitle: string = formMeta?.[0] ?? "Untitled Form";
    const formDescription: string = formMeta?.[1] ?? "";

    const rawFields = data[1][1] as unknown[][];
    const fields: FormField[] = [];

    for (const rawField of rawFields) {
      // Each rawField is: [fieldId?, ?, question, typeCode, [[entryId, ?, ?, options?, ...], ...], ...]
      const question: string = (rawField[1] as string) ?? "";
      const typeCode: number = (rawField[3] as number) ?? 0;
      const fieldType = mapGoogleFieldType(typeCode);

      // The entry information lives in rawField[4]
      const entryInfo = (rawField[4] as unknown[][])?.[0];
      if (!entryInfo) continue;

      const entryId = String(entryInfo[0]);
      const required: boolean = !!(rawField[4] as unknown[][])?.[0]?.[2];

      // Options are in entryInfo[1]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawOptions = (entryInfo[1] as any[]) ?? [];
      const options: string[] =
        rawOptions.length > 0
          ? rawOptions.map((o: unknown[]) => String((o as unknown[])[0] ?? ""))
          : [];

      const field: FormField = {
        entryId,
        question,
        type: fieldType,
        required,
      };

      if (options.length > 0) {
        field.options = options;
      }

      // Linear scale: entryInfo[3] = [min, max, minLabel, maxLabel]
      if (fieldType === "linear_scale" && Array.isArray(entryInfo[3])) {
        const scaleInfo = entryInfo[3] as [number, number, string, string];
        field.scaleMin = scaleInfo[0] ?? 1;
        field.scaleMax = scaleInfo[1] ?? 5;
        field.scaleMinLabel = scaleInfo[2] ?? "";
        field.scaleMaxLabel = scaleInfo[3] ?? "";
      }

      fields.push(field);
    }

    const submitUrl = buildSubmitUrl(formUrl);

    return {
      formTitle,
      formDescription: formDescription || undefined,
      fields,
      submitUrl,
    };
  } finally {
    await browser.close();
  }
}
