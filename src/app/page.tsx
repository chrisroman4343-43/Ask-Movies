"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import OpportunityDashboard from "@/components/OpportunityDashboard";
import OpportunityFinder from "@/components/OpportunityFinder";
import {
  INITIAL_OPPORTUNITY,
  INITIAL_TASKS,
  INITIAL_VALIDATION_TESTS,
} from "@/lib/businessContext";
import type { Task } from "@/types";

type Tab = "chat" | "find" | "dashboard";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("find");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const handleActionClick = (action: string) => {
    const newTask: Task = {
      title: action,
      owner: "Me",
      dueDate: "Now",
      costEstimate: 0,
      priority: "High",
      status: "in progress",
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "find", label: "Find Businesses", icon: "🔍" },
    { id: "chat", label: "Operator Chat", icon: "🔥" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-none">
              Business Operator AI
            </h1>
            <p className="text-xs text-slate-500">
              Autonomous · Find · Validate · Operate
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="hidden sm:inline">Live · Gemini 2.0 Flash · Free</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "find" && <OpportunityFinder />}
        {activeTab === "chat" && (
          <ChatInterface onActionClick={handleActionClick} />
        )}
        {activeTab === "dashboard" && (
          <div className="h-full overflow-y-auto p-4">
            <OpportunityDashboard
              opportunity={INITIAL_OPPORTUNITY}
              tasks={tasks}
              validationTests={INITIAL_VALIDATION_TESTS}
            />
          </div>
        )}
      </div>
    </div>
  );
}
