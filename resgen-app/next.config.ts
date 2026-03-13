import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OPENAI_API_KEY is a server-only secret — it must NOT be exposed to the
  // browser bundle. Next.js keeps plain `process.env.*` references in API
  // routes / Server Components server-side automatically, so no extra config
  // is needed. Listing it here under `serverExternalPackages` ensures
  // `openai` (which uses Node.js-only APIs) is not bundled for the Edge runtime.
  serverExternalPackages: ["openai", "playwright"],
};

export default nextConfig;
