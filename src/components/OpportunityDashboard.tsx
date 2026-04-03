"use client";

import type { Opportunity, Task, ValidationTest } from "@/types";

interface Props {
  opportunity: Opportunity;
  tasks: Task[];
  validationTests: ValidationTest[];
}

const statusColors: Record<string, string> = {
  new: "bg-slate-600 text-slate-200",
  validating: "bg-yellow-800/60 text-yellow-300",
  launched: "bg-green-800/60 text-green-300",
  paused: "bg-orange-800/60 text-orange-300",
  killed: "bg-red-800/60 text-red-300",
};

const taskStatusColors: Record<string, string> = {
  queued: "text-slate-400",
  "in progress": "text-blue-400",
  waiting: "text-yellow-400",
  done: "text-green-400",
  blocked: "text-red-400",
};

const priorityDot: Record<string, string> = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-slate-500",
};

const scorecardLabels: Record<string, string> = {
  demandPotential: "Demand",
  startupCost: "Low Cost",
  speedToRevenue: "Speed",
  fitWithSkills: "Skill Fit",
  operationalSimplicity: "Simplicity",
  repeatCustomerPotential: "Repeat Buy",
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-orange-500 transition-all"
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-4">{score}</span>
    </div>
  );
}

export default function OpportunityDashboard({
  opportunity,
  tasks,
  validationTests,
}: Props) {
  const activeTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1">
      {/* Opportunity Header */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-sm font-bold text-slate-100 leading-tight">
            {opportunity.title}
          </h2>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[opportunity.status]}`}
          >
            {opportunity.status}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">{opportunity.offer}</p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Channel", value: opportunity.acquisitionChannel },
            { label: "Margin", value: opportunity.expectedMargin },
            { label: "Startup Cost", value: `$${opportunity.startupCost}` },
            { label: "Time to Sale", value: opportunity.timeToFirstSale },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-700/40 rounded-lg p-2">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xs font-semibold text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scorecard */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Scorecard
          </h3>
          <span className="text-lg font-bold text-orange-400">
            {opportunity.scorecard.totalScore}
            <span className="text-xs text-slate-500 font-normal">/60</span>
          </span>
        </div>
        <div className="space-y-2">
          {(Object.entries(scorecardLabels) as [keyof typeof opportunity.scorecard, string][]).map(
            ([key, label]) => (
              <div key={key}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
                <ScoreBar score={opportunity.scorecard[key] as number} />
              </div>
            )
          )}
        </div>
      </div>

      {/* Active Tasks */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Tasks ({activeTasks.length} active)
        </h3>
        <div className="space-y-2">
          {activeTasks.map((task, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 bg-slate-700/30 rounded-lg"
            >
              <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 leading-snug">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium ${taskStatusColors[task.status]}`}>
                    {task.status}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-500">{task.owner}</span>
                </div>
              </div>
            </div>
          ))}
          {doneTasks.length > 0 && (
            <p className="text-xs text-slate-600 text-center mt-1">
              {doneTasks.length} task{doneTasks.length > 1 ? "s" : ""} done ✓
            </p>
          )}
        </div>
      </div>

      {/* Validation Tests */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Validation Tests
        </h3>
        <div className="space-y-3">
          {validationTests.map((test, i) => (
            <div key={i} className="border border-slate-700/40 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-orange-400 uppercase">
                  {test.type}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-2 leading-snug">{test.content}</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "Views", value: test.results.views },
                  { label: "Replies", value: test.results.replies },
                  { label: "Sales", value: test.results.sales },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-700/40 rounded p-1.5 text-center">
                    <p className="text-xs font-bold text-slate-100">{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Known Risks
        </h3>
        <ul className="space-y-1">
          {opportunity.risks.map((risk, i) => (
            <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
              <span className="text-red-500 mt-0.5">⚠</span>
              {risk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
