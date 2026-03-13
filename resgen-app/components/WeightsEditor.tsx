"use client";

import type { FormField, OptionWeights } from "@/lib/types";

interface WeightsEditorProps {
  fields: FormField[];
  weights: Record<string, OptionWeights>;
  onChange: (updated: Record<string, OptionWeights>) => void;
}

/**
 * Allows the user to assign percentage weights to MCQ/dropdown options.
 * Fields without options (short answer, paragraph, etc.) are skipped.
 */
export default function WeightsEditor({ fields, weights, onChange }: WeightsEditorProps) {
  const mcqFields = fields.filter(
    (f) => (f.type === "multiple_choice" || f.type === "dropdown") && f.options && f.options.length > 0
  );

  if (mcqFields.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic">
        No MCQ or dropdown fields found in this form.
      </p>
    );
  }

  function handleWeightChange(entryId: string, option: string, value: number) {
    const updated: Record<string, OptionWeights> = {
      ...weights,
      [entryId]: {
        ...(weights[entryId] ?? {}),
        [option]: Math.max(0, Math.min(100, value)),
      },
    };
    onChange(updated);
  }

  function handleReset(entryId: string) {
    const updated = { ...weights };
    delete updated[entryId];
    onChange(updated);
  }

  return (
    <div className="space-y-5">
      {mcqFields.map((field) => {
        const fieldWeights = weights[field.entryId] ?? {};
        const total = Object.values(fieldWeights).reduce((s, n) => s + n, 0);

        return (
          <div key={field.entryId} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-gray-800 flex-1 pr-4 truncate">
                {field.question}
              </p>
              {Object.keys(fieldWeights).length > 0 && (
                <button
                  onClick={() => handleReset(field.entryId)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-2">
              {(field.options ?? []).map((opt) => {
                const w = fieldWeights[opt] ?? 0;
                const pct = total > 0 ? Math.round((w / total) * 100) : 0;

                return (
                  <div key={opt} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-24 truncate flex-shrink-0">
                      {opt}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={w}
                      onChange={(e) =>
                        handleWeightChange(field.entryId, opt, Number(e.target.value))
                      }
                      className="flex-1 accent-indigo-500"
                    />
                    <span className="text-xs font-mono text-gray-700 w-8 text-right">
                      {w === 0 ? "—" : `${pct}%`}
                    </span>
                  </div>
                );
              })}
            </div>

            {total > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Relative weights (not required to sum to 100)
              </p>
            )}
            {total === 0 && (
              <p className="text-xs text-gray-400 mt-2 italic">
                All options equally likely — drag sliders to set weights
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
