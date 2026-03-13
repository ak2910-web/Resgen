# ResGen — Form Testing & Synthetic Data Generator

Generate realistic, profile-aware test responses for Google Forms. Built with **Next.js + Tailwind CSS**, deployable to **Vercel** in one click.

---

## Features

| Feature | Description |
|---|---|
| 🔍 **Form Analyzer** | Detects all field types (MCQ, checkboxes, dropdown, scale, date, text…) from any public Google Form |
| 👤 **50 Synthetic Profiles** | Diverse mock respondents (name, age, email, occupation, location) used to make responses realistic |
| 🎲 **Random Mode** | Profile-aware random answers; heuristics map name/email/age fields to the correct profile detail |
| ⚖️ **Weighted MCQ** | Set answer-distribution weights per question (e.g. "Excellent" 50 %, "Good" 30 %) |
| 🤖 **AI Mode** | OpenAI generates one contextual answer per respondent profile — requires `OPENAI_API_KEY` |
| 📄 **CSV Mode** | Upload your own participant CSV; columns are matched to form fields automatically |
| 📊 **Dashboard** | Question-type breakdown, per-option distribution charts, and a respondent log |
| 🚀 **Bulk Submission** | Posts up to 1 000 responses with a configurable delay between each |

---

## Local Development

### 1. Install dependencies

```bash
cd resgen-app
npm install
npx playwright install chromium --with-deps   # headless browser for form analysis
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your OpenAI API key (optional — the app works without it using random+profile mode):

```
OPENAI_API_KEY=sk-...
```

### 3. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Set the **Root Directory** to `resgen-app`.
4. Under **Environment Variables**, add:

   | Variable | Value |
   |---|---|
   | `OPENAI_API_KEY` | `sk-...` (your OpenAI key) |

5. Click **Deploy** — Vercel will run `npm install && npx playwright install chromium --with-deps && npm run build` automatically (configured in `vercel.json`).

### Option B — Vercel CLI

```bash
npm i -g vercel
cd resgen-app
vercel env add OPENAI_API_KEY   # paste your key when prompted
vercel --prod
```

### Environment Variables reference

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | **No** | Enables the "AI Generated" response mode. Without it, the app falls back to random+profile generation silently. Get a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys). |

> **Security note:** `OPENAI_API_KEY` is a **server-only** secret. It is only read inside Next.js API routes (`/api/generate`) and is never sent to the browser.

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/analyze` | `POST` | Fetch & parse a Google Form, return detected fields |
| `/api/generate` | `POST` | Generate synthetic responses (random / AI / CSV) |
| `/api/submit` | `POST` | POST responses to the Google Form submission URL |

All routes accept and return JSON.

---

## Project Structure

```
resgen-app/
├── app/
│   ├── page.tsx              # Main UI (multi-step wizard)
│   ├── layout.tsx
│   └── api/
│       ├── analyze/route.ts  # Form parser endpoint
│       ├── generate/route.ts # Response generator endpoint
│       └── submit/route.ts   # Form submitter endpoint
├── components/
│   ├── FieldCard.tsx         # Single field display
│   ├── Dashboard.tsx         # Analytics dashboard
│   ├── WeightsEditor.tsx     # MCQ weight sliders
│   └── ResultsPanel.tsx      # Submission result summary
├── lib/
│   ├── types.ts              # Shared TypeScript types
│   ├── formAnalyzer.ts       # Playwright-based form scraper
│   ├── syntheticProfiles.ts  # 50 diverse mock respondents
│   ├── responseGenerator.ts  # Random / AI / CSV generators
│   ├── formSubmitter.ts      # HTTP POST to Google Forms
│   └── csvParser.ts          # Client-side CSV parser
├── .env.example              # Environment variable template
└── vercel.json               # Vercel deployment config
```

---

## Ethical Use

This tool is designed for:
- ✅ QA testing forms before launch
- ✅ Generating synthetic datasets for research
- ✅ Validating survey logic and branching
- ✅ Learning browser automation and AI integration

Do **not** use it to manipulate real surveys or violate [Google's Terms of Service](https://policies.google.com/terms).
