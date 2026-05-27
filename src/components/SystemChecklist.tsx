import React, { useState } from "react";
import { ChecklistItem } from "../types";
import { CheckSquare, Square, Clipboard, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

interface SystemChecklistProps {
  checklist: ChecklistItem[];
  onChecklistItemToggle: (step: string) => void;
  productionReadyScore: number;
}

export const SystemChecklist: React.FC<SystemChecklistProps> = ({
  checklist,
  onChecklistItemToggle,
  productionReadyScore,
}) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopyCommand = (command: string, step: string) => {
    navigator.clipboard.writeText(command);
    setCopySuccess(step);
    setTimeout(() => {
      setCopySuccess(null);
    }, 2000);
  };

  return (
    <div id="checklist-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Central Interactive Grid lists */}
      <div className="lg:col-span-2 bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-brand-accent w-5 h-5" />
            <h3 className="font-semibold text-brand-text text-sm tracking-wide">Interactive Deployment Validation</h3>
          </div>
          <span className="text-xs text-brand-text-dim font-mono">Check off tasks as you setup environments</span>
        </div>

        {/* Categories of tasks */}
        <div className="space-y-3">
          {checklist.map((item, idx) => {
            const isCompleted = item.validated;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border transition-all ${
                  isCompleted
                    ? "bg-brand-surface-alt/40 border-brand-border/80 opacity-80"
                    : "bg-brand-surface-alt/10 border-brand-border hover:bg-brand-surface-alt/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Tick box trigger */}
                    <button
                      type="button"
                      onClick={() => onChecklistItemToggle(item.step)}
                      className="mt-0.5 text-brand-text-dim hover:text-brand-accent focus:outline-none shrink-0 cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-brand-accent" />
                      ) : (
                        <Square className="w-5 h-5 text-brand-text-dim/60" />
                      )}
                    </button>
                    
                    <div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-bg text-brand-text-dim border border-brand-border tracking-wide font-semibold">
                        {item.category}
                      </span>
                      <h4 className={`text-xs font-semibold mt-1.5 ${isCompleted ? "line-through text-brand-text-dim" : "text-brand-text"}`}>
                        {item.step}
                      </h4>
                    </div>
                  </div>

                  {/* Copy command trigger */}
                  {item.command && (
                    <button
                      type="button"
                      onClick={() => handleCopyCommand(item.command, item.step)}
                      className="px-2 py-1 bg-brand-bg hover:opacity-90 rounded border border-brand-border flex items-center gap-1.5 text-[10px] text-brand-text-dim font-mono transition-colors cursor-pointer shrink-0 mt-1"
                    >
                      <Clipboard className="w-3 h-3 text-brand-text-dim" />
                      {copySuccess === item.step ? "Copied!" : "View CLI"}
                    </button>
                  )}
                </div>

                {/* Show active CLI block under list item if needed */}
                {!isCompleted && item.command && (
                  <div className="mt-2.5 p-2 bg-black font-mono text-[10.5px] text-brand-text-dim/80 border border-brand-border rounded overflow-x-auto whitespace-pre select-all text-left">
                    <span className="text-brand-text-dim/45 select-none">$ </span>{item.command}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Readiness Status card group */}
      <div className="flex flex-col gap-5 text-left">
        <div id="readiness-summary-card" className="bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl">
          <h4 className="text-xs uppercase text-brand-text-dim font-bold tracking-wider mb-4">Enterprise Production Readiness</h4>
          
          {/* Radial-like Gauge Score Representation */}
          <div className="flex flex-col items-center justify-center p-4 bg-brand-bg rounded-lg border border-brand-border text-center mb-4">
            <div className="relative flex items-center justify-center">
              {/* Outer stroke circle */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#222222"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={productionReadyScore > 75 ? "#10b981" : productionReadyScore > 40 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2.5 * 2 * Math.PI * 40 / 10}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - productionReadyScore / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute text-2xl font-black text-brand-text font-mono">
                {productionReadyScore}%
              </div>
            </div>

            <span className="text-xs font-semibold text-brand-text mt-3 block">
              Deployment Stage: {productionReadyScore === 100 ? "Ready for Traffic" : productionReadyScore > 60 ? "Active Testing" : "Laying Groundwork"}
            </span>
          </div>

          <p className="text-xs text-brand-text-dim leading-relaxed">
            By checking off deployed modules, AWS configuration compliance scores update. Ensure audits match AWS Organizations Control Tower settings prior to live routing.
          </p>
        </div>

        {/* Safety Check warning */}
        <div className="bg-amber-950/10 rounded-xl p-4 border border-amber-500/20 flex gap-3 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-400">AWS Identity Guardrails</span>
            <p className="text-brand-text-dim mt-1">
              Never use actual Root Accounts for workload hosting. Set SSO integrations via IAM Identity Center or AWS Directory Services and use individual admin access chains.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
