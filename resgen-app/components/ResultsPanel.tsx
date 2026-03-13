"use client";

import type { SubmitResult } from "@/lib/types";

interface ResultsPanelProps {
  result: SubmitResult;
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  const successRate =
    result.total > 0 ? Math.round((result.successful / result.total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Results</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{result.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-green-50">
          <p className="text-2xl font-bold text-green-600">{result.successful}</p>
          <p className="text-sm text-green-600 mt-1">Successful</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-red-50">
          <p className="text-2xl font-bold text-red-500">{result.failed}</p>
          <p className="text-sm text-red-500 mt-1">Failed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Success rate</span>
          <span>{successRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
          <ul className="text-xs text-red-500 space-y-1 max-h-32 overflow-y-auto bg-red-50 rounded-lg p-3">
            {result.errors.slice(0, 10).map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
            {result.errors.length > 10 && (
              <li className="text-red-400">… and {result.errors.length - 10} more errors</li>
            )}
          </ul>
        </div>
      )}

      {result.successful > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
          ✓ Successfully submitted {result.successful} response
          {result.successful !== 1 ? "s" : ""} to Google Forms.
        </div>
      )}
    </div>
  );
}
