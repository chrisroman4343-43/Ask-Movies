"use client";

import { useState } from "react";

interface FoundOpportunity {
  title: string;
  targetCustomer: string;
  startupCost: number;
  timeToFirstSale: string;
  expectedMargin: string;
  problem: string;
  offer: string;
  acquisitionChannel: string;
  costBreakdown: { item: string; cost: number }[];
  validationSteps: string[];
  risks: string[];
  whyNow: string;
  firstAction: string;
  confidenceScore: number;
  scorecard: {
    demandPotential: number;
    startupCost: number;
    speedToRevenue: number;
    fitWithSkills: number;
    operationalSimplicity: number;
    repeatCustomerPotential: number;
    totalScore: number;
  };
}

const scorecardLabels: Record<string, string> = {
  demandPotential: "Demand",
  startupCost: "Low Cost",
  speedToRevenue: "Speed",
  fitWithSkills: "Skill Fit",
  operationalSimplicity: "Simplicity",
  repeatCustomerPotential: "Repeat Buy",
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 8 ? "bg-green-500" : score >= 6 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${color} transition-all`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-300 w-4">{score}</span>
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-green-900/60 border-green-600/50 text-green-400"
      : score >= 70
      ? "bg-yellow-900/60 border-yellow-600/50 text-yellow-400"
      : "bg-red-900/60 border-red-600/50 text-red-400";
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${color}`}>
      {score}% confidence
    </span>
  );
}

function OpportunityCard({ opp }: { opp: FoundOpportunity }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-700/50 bg-slate-800/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-slate-100">{opp.title}</h3>
          <ConfidenceBadge score={opp.confidenceScore ?? 80} />
        </div>
        <p className="text-xs text-slate-400 mb-3">{opp.offer}</p>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-700/40 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-green-400">
              ${opp.startupCost}
            </p>
            <p className="text-xs text-slate-500">Start Cost</p>
          </div>
          <div className="bg-slate-700/40 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-orange-400">
              {opp.timeToFirstSale}
            </p>
            <p className="text-xs text-slate-500">To First $</p>
          </div>
          <div className="bg-slate-700/40 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-blue-400">{opp.expectedMargin}</p>
            <p className="text-xs text-slate-500">Margin</p>
          </div>
        </div>
      </div>

      {/* Scorecard */}
      <div className="px-4 py-3 border-b border-slate-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Score
          </span>
          <span className="text-base font-bold text-orange-400">
            {opp.scorecard.totalScore}
            <span className="text-xs text-slate-500 font-normal">/60</span>
          </span>
        </div>
        <div className="space-y-1.5">
          {Object.entries(scorecardLabels).map(([key, label]) => (
            <ScoreBar
              key={key}
              score={opp.scorecard[key as keyof typeof opp.scorecard] as number}
              label={label}
            />
          ))}
        </div>
      </div>

      {/* Why Now + First Action */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Why Now
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">{opp.whyNow}</p>
        </div>

        <div className="bg-orange-950/30 border border-orange-700/30 rounded-lg p-3">
          <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold mb-1">
            First Action This Week
          </p>
          <p className="text-xs text-slate-100 leading-relaxed">{opp.firstAction}</p>
        </div>

        {/* Expand for details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
        >
          {expanded ? "▲ Hide details" : "▼ Show full breakdown"}
        </button>

        {expanded && (
          <div className="space-y-3 border-t border-slate-700/30 pt-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                Problem Being Solved
              </p>
              <p className="text-xs text-slate-300">{opp.problem}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                How to Find Customers
              </p>
              <p className="text-xs text-slate-300">{opp.acquisitionChannel}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                Cost Breakdown
              </p>
              <div className="space-y-1">
                {opp.costBreakdown.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-slate-400">{item.item}</span>
                    <span className="text-slate-200 font-semibold">
                      ${item.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                Validation Steps
              </p>
              <ol className="space-y-1">
                {opp.validationSteps.map((step, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-orange-500 font-bold flex-shrink-0">
                      {i + 1}.
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                Risks
              </p>
              <ul className="space-y-1">
                {opp.risks.map((risk, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-1.5">
                    <span className="text-red-400">⚠</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OpportunityFinder() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [opportunities, setOpportunities] = useState<FoundOpportunity[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (customQuery?: string) => {
    setLoading(true);
    setOpportunities([]);
    setStatus("Initializing autonomous search...");

    try {
      const res = await fetch("/api/find-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: customQuery ?? query }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const payload = line.replace("data: ", "").trim();
          if (payload === "[DONE]") break;

          try {
            const msg = JSON.parse(payload);
            if (msg.type === "status") setStatus(msg.message);
            if (msg.type === "result") {
              setOpportunities(msg.data.opportunities ?? []);
              setStatus("");
            }
            if (msg.type === "error") {
              setStatus(`Error: ${msg.message}`);
            }
          } catch {
            /* skip non-JSON lines */
          }
        }
      }
    } catch (err) {
      setStatus(`Network error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_SEARCHES = [
    "physical service businesses I can do outdoors",
    "online businesses I can run from home",
    "flipping and reselling for fast cash",
    "AI or digital services with recurring income",
    "seasonal businesses that spike in summer",
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="p-4 border-b border-slate-700/50 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 mb-0.5">
            Autonomous Business Finder
          </h2>
          <p className="text-xs text-slate-500">
            Agent searches the web, validates demand, and scores real opportunities.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Focus search (optional)... e.g. outdoor services"
            className="flex-1 bg-slate-800 border border-slate-600/50 focus:border-orange-500/50 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
          />
          <button
            onClick={() => runSearch()}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? "Searching..." : "Find Businesses"}
          </button>
        </div>

        {/* Quick search pills */}
        {!loading && opportunities.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((s) => (
              <button
                key={s}
                onClick={() => runSearch(s)}
                className="text-xs text-slate-400 border border-slate-700 hover:border-orange-500/50 hover:text-slate-200 rounded-full px-3 py-1 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-slate-400 text-center max-w-xs">{status}</p>
            <p className="text-xs text-slate-600 text-center">
              Agent is researching and validating with live web data — this takes ~30s
            </p>
          </div>
        )}

        {!loading && opportunities.length === 0 && !status && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
            <div className="text-5xl">🔍</div>
            <div>
              <p className="text-slate-300 font-semibold mb-1">
                No results yet
              </p>
              <p className="text-sm text-slate-500 max-w-sm">
                Hit{" "}
                <span className="text-orange-400 font-semibold">
                  Find Businesses
                </span>{" "}
                and the agent will search the web, validate real demand, and score
                the best opportunities for you.
              </p>
            </div>
          </div>
        )}

        {!loading && status && opportunities.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-red-400">{status}</p>
          </div>
        )}

        {opportunities.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {opportunities.length} opportunities validated &amp; scored
              </p>
              <button
                onClick={() => runSearch()}
                className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                Refresh search ↺
              </button>
            </div>
            {opportunities
              .sort((a, b) => b.scorecard.totalScore - a.scorecard.totalScore)
              .map((opp, i) => (
                <OpportunityCard key={i} opp={opp} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
