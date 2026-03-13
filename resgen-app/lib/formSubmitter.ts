import type { GeneratedResponse, SubmitResult } from "./types";

/**
 * Submits a single Google Form response by POSTing to the formResponse URL.
 */
async function submitSingle(
  submitUrl: string,
  response: GeneratedResponse
): Promise<void> {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(response.entries)) {
    if (Array.isArray(value)) {
      // Checkboxes: each selection is a separate entry with the same key
      for (const v of value) {
        params.append(key, v);
      }
    } else {
      params.append(key, value);
    }
  }

  const res = await fetch(submitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: params.toString(),
    redirect: "manual",
  });

  // Google Forms returns a 302 redirect on success
  if (res.status !== 302 && res.status !== 200) {
    throw new Error(`Unexpected status: ${res.status}`);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Submits multiple responses sequentially with an optional delay between each.
 */
export async function submitResponses(
  submitUrl: string,
  responses: GeneratedResponse[],
  delayMs = 500
): Promise<SubmitResult> {
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const response of responses) {
    try {
      await submitSingle(submitUrl, response);
      successful++;
    } catch (err) {
      failed++;
      errors.push(err instanceof Error ? err.message : String(err));
    }

    if (delayMs > 0) {
      await delay(delayMs);
    }
  }

  return {
    total: responses.length,
    successful,
    failed,
    errors,
  };
}
