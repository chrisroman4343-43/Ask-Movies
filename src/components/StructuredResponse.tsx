"use client";

import type { StructuredResponse } from "@/types";
import { extractExtraContent } from "@/lib/parseResponse";

interface Props {
  data: StructuredResponse;
  onActionClick?: (action: string) => void;
}

const riskColors = {
  Low: "bg-green-900/40 text-green-400 border-green-700/50",
  Medium: "bg-yellow-900/40 text-yellow-400 border-yellow-700/50",
  High: "bg-red-900/40 text-red-400 border-red-700/50",
};

export default function StructuredResponseCard({ data, onActionClick }: Props) {
  const extraContent = extractExtraContent(data.rawText);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-700/40 px-4 py-2.5 border-b border-slate-700/50 flex items-center justify-between">
        <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
          Operator Decision
        </span>
        <div className="flex gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${riskColors[data.riskLevel]}`}
          >
            {data.riskLevel} Risk
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              data.approvalNeeded === "Yes"
                ? "bg-orange-900/40 text-orange-400 border-orange-700/50"
                : "bg-slate-700/40 text-slate-400 border-slate-600/50"
            }`}
          >
            {data.approvalNeeded === "Yes" ? "Needs Approval" : "Auto-Execute"}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Objective */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Objective
          </p>
          <p className="text-slate-100 font-medium">{data.objective}</p>
        </div>

        {/* Reasoning */}
        {data.reasoning && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Reasoning
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{data.reasoning}</p>
          </div>
        )}

        {/* Action Box */}
        <div className="bg-orange-950/30 border border-orange-700/30 rounded-lg p-3">
          <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold mb-1.5">
            Recommended Action
          </p>
          <p className="text-slate-100 text-sm font-medium mb-3">
            {data.recommendedAction}
          </p>
          {onActionClick && (
            <button
              onClick={() => onActionClick(data.recommendedAction)}
              className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              Execute This Action →
            </button>
          )}
        </div>

        {/* Cost + Outcome row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/30 rounded-lg p-2.5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Cost
            </p>
            <p className="text-slate-100 font-semibold">{data.cost}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-2.5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Expected Outcome
            </p>
            <p className="text-slate-300 text-xs leading-relaxed">{data.expectedOutcome}</p>
          </div>
        </div>

        {/* Extra content (copy, templates, etc.) */}
        {extraContent && (
          <div className="border-t border-slate-700/50 pt-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
              Additional Content
            </p>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-slate-900/40 rounded-lg p-3">
              {extraContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
