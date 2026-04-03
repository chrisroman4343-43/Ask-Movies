"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import OpportunityDashboard from "@/components/OpportunityDashboard";
import {
  INITIAL_OPPORTUNITY,
  INITIAL_TASKS,
  INITIAL_VALIDATION_TESTS,
} from "@/lib/businessContext";
import type { Task } from "@/types";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleActionClick = (action: string) => {
    // When the user clicks "Execute This Action", add it as a task
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

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 transition-all duration-300 border-r border-slate-700/50 bg-slate-900/80 ${
          sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-xs font-bold text-orange-400">PEI Fire Pit Desk</p>
                <p className="text-xs text-slate-500">Operator Dashboard</p>
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="flex-1 overflow-hidden p-3">
            <OpportunityDashboard
              opportunity={INITIAL_OPPORTUNITY}
              tasks={tasks}
              validationTests={INITIAL_VALIDATION_TESTS}
            />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
              title="Toggle sidebar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-100">Business Operator AI</h1>
              <p className="text-xs text-slate-500">
                Autonomous operator · Pickard&apos;s PEI Fire Pit Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Claude Opus 4.6
            </span>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface onActionClick={handleActionClick} />
        </div>
      </div>
    </div>
  );
}
