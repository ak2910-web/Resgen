"use client";

import { useState, useRef } from "react";
import FieldCard from "@/components/FieldCard";
import ResultsPanel from "@/components/ResultsPanel";
import Dashboard from "@/components/Dashboard";
import WeightsEditor from "@/components/WeightsEditor";
import { parseCsvText } from "@/lib/csvParser";
import type {
  AnalyzeResponse,
  ResponseMode,
  GeneratedResponse,
  SubmitResult,
  OptionWeights,
} from "@/lib/types";

type Step = "input" | "analyze" | "configure" | "preview" | "submitting" | "done";
type PreviewTab = "responses" | "dashboard";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [formUrl, setFormUrl] = useState("");
  const [formData, setFormData] = useState<AnalyzeResponse | null>(null);
  const [mode, setMode] = useState<ResponseMode>("random");
  const [count, setCount] = useState(10);
  const [delayMs, setDelayMs] = useState(500);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [fieldWeights, setFieldWeights] = useState<Record<string, OptionWeights>>({});
  const [showWeights, setShowWeights] = useState(false);
  const [generatedResponses, setGeneratedResponses] = useState<GeneratedResponse[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("responses");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 1: Analyze form ──────────────────────────────────────────────────
  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setStep("analyze");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to analyze form.");
      setFormData(data as AnalyzeResponse);
      setFieldWeights({});
      setStep("configure");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("input");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Generate responses ────────────────────────────────────────────
  async function handleGenerate() {
    if (!formData) return;
    setError("");
    setLoading(true);

    try {
      const body = {
        fields: formData.fields,
        mode,
        count,
        csvData: mode === "csv" ? csvData : undefined,
        fieldWeights: Object.keys(fieldWeights).length > 0 ? fieldWeights : undefined,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate responses.");
      setGeneratedResponses(data.responses);
      setPreviewTab("responses");
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: Submit responses ──────────────────────────────────────────────
  async function handleSubmit() {
    if (!formData) return;
    setError("");
    setLoading(true);
    setStep("submitting");

    try {
      const body = { submitUrl: formData.submitUrl, responses: generatedResponses, delayMs };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit responses.");
      setSubmitResult(data as SubmitResult);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("preview");
    } finally {
      setLoading(false);
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function handleReset() {
    setStep("input");
    setFormUrl("");
    setFormData(null);
    setMode("random");
    setCount(10);
    setDelayMs(500);
    setCsvData([]);
    setCsvFileName("");
    setFieldWeights({});
    setShowWeights(false);
    setGeneratedResponses([]);
    setSubmitResult(null);
    setError("");
  }

  // ── CSV upload ────────────────────────────────────────────────────────────
  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvData(parseCsvText(text));
    };
    reader.readAsText(file);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ResGen</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Form Testing &amp; Synthetic Data Generator</p>
            </div>
          </div>
          {step !== "input" && (
            <button onClick={handleReset}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
              ← Start over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* ── INPUT ─────────────────────────────────────────────────────────── */}
        {(step === "input" || step === "analyze") && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block mb-3 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                QA Testing &amp; Synthetic Data
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
                Test Your Google Form Instantly
              </h2>
              <p className="text-lg text-gray-500">
                Generate realistic synthetic responses using 50 diverse user profiles.
                Perfect for QA testing, survey logic validation, and mock dataset creation.
              </p>
            </div>

            <form onSubmit={handleAnalyze}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Google Form URL
              </label>
              <input
                type="url" value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/…/viewform"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
              />

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="mt-6 w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><Spinner /> Analyzing Form…</>
                ) : "Analyze Form →"}
              </button>
            </form>

            {/* Feature pills */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { icon: "👤", label: "50 Synthetic Profiles" },
                { icon: "🎲", label: "Weighted MCQ" },
                { icon: "🤖", label: "AI Answers" },
                { icon: "📊", label: "Analytics Dashboard" },
              ].map(({ icon, label }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-3 text-sm">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xs text-gray-600 font-medium">{label}</div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              ⚠️ For QA testing and mock data generation only. Respect Google&apos;s Terms of Service.
            </p>
          </div>
        )}

        {/* ── CONFIGURE ─────────────────────────────────────────────────────── */}
        {step === "configure" && formData && (
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left: form info + fields */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{formData.formTitle}</h3>
                    {formData.formDescription && (
                      <p className="text-sm text-gray-500 mt-0.5">{formData.formDescription}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.fields.length} field{formData.fields.length !== 1 ? "s" : ""} detected
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-500 mb-3 text-xs uppercase tracking-wider">
                Detected Fields
              </h3>
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {formData.fields.map((field, i) => (
                  <FieldCard key={field.entryId} field={field} index={i} />
                ))}
              </div>
            </div>

            {/* Right: config panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-5">Configure</h3>

                {/* Count */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of responses
                  </label>
                  <input type="number" min={1} max={1000} value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  <p className="text-xs text-gray-400 mt-1">
                    Uses {Math.min(count, 50)} of the 50 synthetic profiles, cycling as needed.
                  </p>
                </div>

                {/* Mode */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response mode</label>
                  <div className="space-y-2">
                    {(["random", "ai", "csv"] as ResponseMode[]).map((m) => (
                      <label key={m}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          mode === m ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <input type="radio" name="mode" value={m} checked={mode === m}
                          onChange={() => setMode(m)} className="mt-0.5 accent-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {m === "random" ? "🎲 Random" : m === "ai" ? "🤖 AI Generated" : "📄 Upload CSV"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {m === "random" && "Profile-aware random answers with weighted MCQ support"}
                            {m === "ai" && "AI generates answers tailored to each respondent's profile"}
                            {m === "csv" && "Fill responses from your own CSV data"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* CSV upload */}
                {mode === "csv" && (
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV</label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}>
                      {csvFileName ? (
                        <p className="text-sm text-indigo-600 font-medium">{csvFileName}</p>
                      ) : (
                        <>
                          <svg className="w-7 h-7 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-gray-500">Click to upload CSV</p>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept=".csv,text/csv"
                      className="hidden" onChange={handleCsvUpload} />
                    {csvData.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">✓ {csvData.length} row{csvData.length !== 1 ? "s" : ""} loaded</p>
                    )}
                  </div>
                )}

                {/* Weighted MCQ toggle */}
                {(mode === "random" || mode === "csv") && formData.fields.some(
                  (f) => (f.type === "multiple_choice" || f.type === "dropdown") && f.options
                ) && (
                  <div className="mb-5">
                    <button
                      onClick={() => setShowWeights(!showWeights)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors">
                      <svg className={`w-4 h-4 transition-transform ${showWeights ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {showWeights ? "Hide" : "Set"} MCQ answer weights
                    </button>
                    {showWeights && (
                      <div className="mt-3 max-h-64 overflow-y-auto pr-1">
                        <WeightsEditor
                          fields={formData.fields}
                          weights={fieldWeights}
                          onChange={setFieldWeights} />
                      </div>
                    )}
                  </div>
                )}

                {/* Delay */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delay between submissions
                  </label>
                  <select value={delayMs} onChange={(e) => setDelayMs(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    <option value={0}>None (fastest)</option>
                    <option value={200}>200 ms</option>
                    <option value={500}>500 ms (default)</option>
                    <option value={1000}>1 second</option>
                    <option value={2000}>2 seconds</option>
                    <option value={5000}>5 seconds</option>
                  </select>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading || (mode === "csv" && csvData.length === 0)}
                  className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><Spinner /> Generating…</> : `Generate ${count} Response${count !== 1 ? "s" : ""} →`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PREVIEW ───────────────────────────────────────────────────────── */}
        {step === "preview" && formData && (
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Preview &amp; Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {generatedResponses.length} synthetic response{generatedResponses.length !== 1 ? "s" : ""} ready for{" "}
                  <span className="font-medium text-gray-700">{formData.formTitle}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("configure")}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2 text-sm">
                  Submit {generatedResponses.length} Response{generatedResponses.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {(["responses", "dashboard"] as PreviewTab[]).map((tab) => (
                <button key={tab} onClick={() => setPreviewTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    previewTab === tab
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {tab === "responses" ? "📋 Responses" : "📊 Dashboard"}
                </button>
              ))}
            </div>

            {/* Responses table */}
            {previewTab === "responses" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Respondent</th>
                        {formData.fields.map((field) => (
                          <th key={field.entryId}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[130px] max-w-[180px]">
                            <span className="block truncate" title={field.question}>
                              {field.question || "Field " + field.entryId}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {generatedResponses.slice(0, 50).map((resp, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{i + 1}</td>
                          <td className="px-4 py-2.5">
                            {resp.profile ? (
                              <div>
                                <p className="text-xs font-medium text-gray-800 truncate w-32">{resp.profile.name}</p>
                                <p className="text-xs text-gray-400">{resp.profile.age} · {resp.profile.occupation}</p>
                              </div>
                            ) : <span className="text-xs text-gray-400">—</span>}
                          </td>
                          {formData.fields.map((field) => {
                            const val = resp.entries[`entry.${field.entryId}`];
                            const display = Array.isArray(val) ? val.join(", ") : val ?? "—";
                            return (
                              <td key={field.entryId} className="px-4 py-2.5 text-sm text-gray-700 max-w-[180px]">
                                <span className="block truncate" title={display}>{display}</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {generatedResponses.length > 50 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                    Showing first 50 of {generatedResponses.length} responses
                  </div>
                )}
              </div>
            )}

            {/* Dashboard tab */}
            {previewTab === "dashboard" && (
              <Dashboard fields={formData.fields} responses={generatedResponses} />
            )}
          </div>
        )}

        {/* ── SUBMITTING ────────────────────────────────────────────────────── */}
        {step === "submitting" && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitting Responses…</h2>
            <p className="text-gray-500 text-sm">
              Submitting {generatedResponses.length} response{generatedResponses.length !== 1 ? "s" : ""} with a {delayMs}ms delay between each.
            </p>
          </div>
        )}

        {/* ── DONE ──────────────────────────────────────────────────────────── */}
        {step === "done" && submitResult && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">All Done!</h2>
            </div>
            <ResultsPanel result={submitResult} />
            <div className="mt-6 text-center">
              <button onClick={handleReset}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                Test Another Form
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ── Tiny reusable spinner ──────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
