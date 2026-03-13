"use client";

import type { FormField } from "@/lib/types";

interface FieldCardProps {
  field: FormField;
  index: number;
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  short_answer: "Short Answer",
  paragraph: "Paragraph",
  multiple_choice: "Multiple Choice",
  checkboxes: "Checkboxes",
  dropdown: "Dropdown",
  linear_scale: "Linear Scale",
  date: "Date",
  time: "Time",
};

const FIELD_TYPE_COLORS: Record<string, string> = {
  short_answer: "bg-blue-100 text-blue-700",
  paragraph: "bg-purple-100 text-purple-700",
  multiple_choice: "bg-green-100 text-green-700",
  checkboxes: "bg-yellow-100 text-yellow-700",
  dropdown: "bg-orange-100 text-orange-700",
  linear_scale: "bg-pink-100 text-pink-700",
  date: "bg-cyan-100 text-cyan-700",
  time: "bg-teal-100 text-teal-700",
};

export default function FieldCard({ field, index }: FieldCardProps) {
  const typeLabel = FIELD_TYPE_LABELS[field.type] ?? field.type;
  const typeColor = FIELD_TYPE_COLORS[field.type] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 break-words">
              {field.question || <em className="text-gray-400">Untitled question</em>}
            </p>
            {field.options && field.options.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {field.options.slice(0, 5).map((opt) => (
                  <span
                    key={opt}
                    className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                  >
                    {opt}
                  </span>
                ))}
                {field.options.length > 5 && (
                  <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                    +{field.options.length - 5} more
                  </span>
                )}
              </div>
            )}
            {field.type === "linear_scale" && (
              <p className="mt-1 text-xs text-gray-500">
                Scale: {field.scaleMin} ({field.scaleMinLabel || "Low"}) →{" "}
                {field.scaleMax} ({field.scaleMaxLabel || "High"})
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
          {field.required && (
            <span className="text-xs text-red-500 font-medium">Required</span>
          )}
        </div>
      </div>
    </div>
  );
}
