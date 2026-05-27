import React, { useState } from "react";
import { CostItem } from "../types";
import { PiggyBank, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface CostCalculatorProps {
  initialCosts: CostItem[];
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ initialCosts }) => {
  const [scalingFactor, setScalingFactor] = useState<number>(1);
  const [customBudget, setCustomBudget] = useState<number>(2500);

  // Compute total monthly base cost
  const baseCost = initialCosts.reduce((acc, curr) => acc + curr.monthlyCost, 0);

  // Compute calculated costs which scale logically based on traffic multiplier (data transfer or DB compute scales)
  const getScaledCostItem = (item: CostItem, factor: number) => {
    let multiplier = 1;
    const name = item.service.toLowerCase();

    // Database scales moderately but caps dynamically due to serverless autoscaling rules
    if (name.includes("aurora") || name.includes("database") || name.includes("rds")) {
      multiplier = Math.max(1, Math.log2(factor) * 0.8 + 1);
    }
    // ECS/Fargate containers scale linearly with compute workloads
    else if (name.includes("fargate") || name.includes("ecs") || name.includes("eks") || name.includes("compute")) {
      multiplier = factor;
    }
    // NAT gateway and bandwidth scales strongly with traffic load
    else if (name.includes("nat gateway") || name.includes("bandwidth") || name.includes("transit")) {
      multiplier = factor * 1.1;
    }
    // Security services & Control tower setups are fixed or scale very gently
    else if (name.includes("security") || name.includes("guardduty") || name.includes("kms") || name.includes("control tower")) {
      multiplier = Math.max(1, factor * 0.1 + 0.9);
    }
    // Default fallback scales slightly with traffic
    else {
      multiplier = Math.max(1, factor * 0.5 + 0.5);
    }

    const calculatedCost = Math.round(item.monthlyCost * multiplier);
    return {
      ...item,
      scaledCost: calculatedCost,
    };
  };

  const scaledCosts = initialCosts.map((item) => getScaledCostItem(item, scalingFactor));
  const totalCost = scaledCosts.reduce((acc, curr) => acc + curr.scaledCost, 0);

  // Budget validation: calculate alert levels
  const overBudgetAmount = totalCost - customBudget;
  const isOverBudget = overBudgetAmount > 0;
  const budgetUtilization = Math.round((totalCost / customBudget) * 100);

  return (
    <div id="cost-calculator-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FinOps Allocation Breakdown */}
      <div id="cost-breakdown-panel" className="lg:col-span-2 bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="text-brand-accent w-5 h-5" />
            <h3 className="font-semibold text-brand-text text-sm tracking-wide">FinOps Allocation Breakdown</h3>
          </div>
          <span className="text-xs text-brand-text-dim font-mono">Based on active design schema</span>
        </div>

        {/* Scaled calculation bars */}
        <div className="space-y-4">
          {scaledCosts.map((item, idx) => {
            const percentage = Math.round((item.scaledCost / totalCost) * 100) || 0;
            return (
              <div key={idx} className="p-3.5 bg-brand-surface-alt rounded-lg border border-brand-border/60 hover:bg-brand-surface-alt/85 transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <h4 className="text-xs text-brand-text font-medium">{item.service}</h4>
                    <p className="text-[11px] text-brand-text-dim mt-0.5 line-clamp-1">{item.explanation}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-brand-text font-mono">${item.scaledCost}</span>
                    <span className="text-[10px] text-brand-text-dim font-mono block">{percentage}% of bill</span>
                  </div>
                </div>
                {/* Visual bar graph */}
                <div className="w-full bg-brand-bg rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-accent h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Scaling Controllers */}
      <div id="pricing-calculator-sidebar" className="flex flex-col gap-5 text-left">
        {/* Dynamic Controls Card */}
        <div className="bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl">
          <h4 className="text-xs uppercase text-brand-text-dim font-bold tracking-wider mb-4">Interactive Performance Scaling</h4>
          
          {/* Slider for workload scaling */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5 text-xs text-brand-text-dim">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-brand-accent" /> Dynamic Load Multiplier</span>
              <span className="text-brand-accent font-bold font-mono">{scalingFactor}x scale</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={scalingFactor}
              onChange={(e) => setScalingFactor(Number(e.target.value))}
              className="w-full h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
            <div className="flex justify-between mt-1 text-[10px] text-brand-text-dim/60 font-mono">
              <span>1x (Dev)</span>
              <span>5x (Staging)</span>
              <span>10x (Enterprise)</span>
            </div>
          </div>

          {/* Budget input setter */}
          <div className="mb-4">
            <label className="block text-xs text-brand-text-dim mb-1.5">Set Custom Monthly Budget Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-brand-text-dim font-mono font-bold text-xs">$</span>
              <input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(Math.max(100, Number(e.target.value)))}
                className="w-full pl-6 pr-3 py-1.5 bg-brand-bg rounded border border-brand-border focus:border-brand-accent focus:outline-none text-xs text-brand-text font-mono font-bold"
              />
            </div>
          </div>

          {/* Active estimation readout */}
          <div className="p-4 bg-brand-bg rounded-lg border border-brand-border">
            <div className="text-[10px] uppercase text-brand-text-dim font-bold tracking-wider">Estimated Scaling Cost</div>
            <div className="text-3xl font-extrabold text-brand-text font-mono mt-0.5">${totalCost}</div>
            <div className="text-[10px] text-brand-text-dim/60 font-mono mt-1">
              Base is ${baseCost}/mo at idle usage.
            </div>
          </div>
        </div>

        {/* Budget Audit Alert Box */}
        <div className={`rounded-xl p-5 border shadow-xl transition-all ${
          isOverBudget
            ? "bg-red-950/10 border-red-500/20 text-red-200"
            : "bg-emerald-950/10 border-emerald-500/20 text-emerald-200"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isOverBudget ? (
              <AlertTriangle className="text-red-400 w-5 h-5 animate-bounce" />
            ) : (
              <ShieldCheck className="text-emerald-450 w-5 h-5" />
            )}
            <h4 className="font-semibold text-xs tracking-wide">
              {isOverBudget ? "Budget Overrun Warning" : "Cost Status Optimal"}
            </h4>
          </div>

          <p className="text-xs text-brand-text-dim leading-relaxed mb-3">
            {isOverBudget
              ? `Your active workload cost configuration ($${totalCost}/mo) exceeds your budget threshold of $${customBudget}/mo by $${overBudgetAmount}/mo.`
              : `Excellent! Estimations align fully within your custom allocated operating limits. Using only ${budgetUtilization}% authorized limits.`}
          </p>

          <div className="flex items-center justify-between text-xs font-mono">
            <span>Utilization Index:</span>
            <span className={`font-bold ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}>
              {budgetUtilization}%
            </span>
          </div>
        </div>

        {/* FinOps recommendations box */}
        <div className="p-4 bg-brand-surface border border-brand-border rounded-xl">
          <div className="flex items-center gap-1 text-brand-text font-semibold text-xs mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
            <span>FinOps Optimization Action Plan</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-brand-text-dim">
            <li>• Bind to **Compute Savings Plans** (Saves ~18% globally)</li>
            <li>• Enforce automated S3 life-cycling directly inside `variables.tf`</li>
            <li>• Restrict NAT gateways down to single ingress node during testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
