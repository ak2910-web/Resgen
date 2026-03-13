"use client";

import type { FormField, GeneratedResponse, FieldType } from "@/lib/types";

interface DashboardProps {
  fields: FormField[];
  responses: GeneratedResponse[];
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  short_answer: "Short Answer",
  paragraph: "Paragraph",
  multiple_choice: "Multiple Choice",
  checkboxes: "Checkboxes",
  dropdown: "Dropdown",
  linear_scale: "Linear Scale",
  date: "Date",
  time: "Time",
};

const FIELD_TYPE_COLORS: Record<FieldType, string> = {
  short_answer: "bg-blue-500",
  paragraph: "bg-purple-500",
  multiple_choice: "bg-green-500",
  checkboxes: "bg-yellow-500",
  dropdown: "bg-orange-500",
  linear_scale: "bg-pink-500",
  date: "bg-cyan-500",
  time: "bg-teal-500",
};

const FIELD_TYPE_BG: Record<FieldType, string> = {
  short_answer: "bg-blue-50 text-blue-700",
  paragraph: "bg-purple-50 text-purple-700",
  multiple_choice: "bg-green-50 text-green-700",
  checkboxes: "bg-yellow-50 text-yellow-700",
  dropdown: "bg-orange-50 text-orange-700",
  linear_scale: "bg-pink-50 text-pink-700",
  date: "bg-cyan-50 text-cyan-700",
  time: "bg-teal-50 text-teal-700",
};

export default function Dashboard({ fields, responses }: DashboardProps) {
  // ── Question-type breakdown ───────────────────────────────────────────────
  const typeCounts = fields.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});

  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const maxTypeCount = Math.max(...Object.values(typeCounts), 1);

  // ── MCQ option distribution ───────────────────────────────────────────────
  const mcqFields = fields.filter(
    (f) => f.type === "multiple_choice" || f.type === "dropdown"
  );

  const optionDist: Record<string, Record<string, number>> = {};
  for (const field of mcqFields) {
    optionDist[field.entryId] = {};
    for (const resp of responses) {
      const val = resp.entries[`entry.${field.entryId}`];
      if (typeof val === "string") {
        optionDist[field.entryId][val] = (optionDist[field.entryId][val] ?? 0) + 1;
      }
    }
  }

  // ── Profile log ────────────────────────────────────────────────────────────
  const profileRows = responses.slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Responses" value={responses.length} color="indigo" />
        <StatCard label="Form Fields" value={fields.length} color="green" />
        <StatCard label="Field Types" value={typeEntries.length} color="purple" />
        <StatCard
          label="Unique Profiles"
          value={Math.min(responses.length, 50)}
          color="orange"
        />
      </div>

      {/* Question-type breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Question Type Breakdown</h3>
        <div className="space-y-3">
          {typeEntries.map(([type, count]) => (
            <div key={type} className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full w-32 text-center flex-shrink-0 ${
                  FIELD_TYPE_BG[type as FieldType] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {FIELD_TYPE_LABELS[type as FieldType] ?? type}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    FIELD_TYPE_COLORS[type as FieldType] ?? "bg-gray-400"
                  }`}
                  style={{ width: `${(count / maxTypeCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 w-6 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MCQ option distributions */}
      {mcqFields.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Response Distribution (MCQ / Dropdown)
          </h3>
          <div className="space-y-6">
            {mcqFields.map((field) => {
              const dist = optionDist[field.entryId] ?? {};
              const total = Object.values(dist).reduce((s, n) => s + n, 0) || 1;
              const sortedOpts = Object.entries(dist).sort((a, b) => b[1] - a[1]);

              return (
                <div key={field.entryId}>
                  <p className="text-sm font-medium text-gray-700 mb-2 truncate">
                    {field.question}
                  </p>
                  <div className="space-y-1.5">
                    {sortedOpts.map(([opt, cnt]) => {
                      const pct = Math.round((cnt / total) * 100);
                      return (
                        <div key={opt} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-28 truncate flex-shrink-0">
                            {opt}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-indigo-400 h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile log */}
      {profileRows.some((r) => r.profile) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Synthetic Respondent Log{" "}
            <span className="text-xs font-normal text-gray-500">
              (first {Math.min(20, responses.length)} of {responses.length})
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-2 pr-4 text-left font-semibold">#</th>
                  <th className="pb-2 pr-4 text-left font-semibold">Name</th>
                  <th className="pb-2 pr-4 text-left font-semibold">Age</th>
                  <th className="pb-2 text-left font-semibold">Occupation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {profileRows.map((resp, i) =>
                  resp.profile ? (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-1.5 pr-4 text-gray-400 font-mono text-xs">
                        {i + 1}
                      </td>
                      <td className="py-1.5 pr-4 font-medium text-gray-800">
                        {resp.profile.name}
                      </td>
                      <td className="py-1.5 pr-4 text-gray-600">{resp.profile.age}</td>
                      <td className="py-1.5 text-gray-600">{resp.profile.occupation}</td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper component
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "indigo" | "green" | "purple" | "orange";
}) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className={`rounded-xl p-4 ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-75">{label}</p>
    </div>
  );
}
