import React, { useState } from "react";
import { QuestionnaireInputs, LandingZoneOutput, ChatMessage } from "./types";
import { DEFAULT_INPUTS, DEFAULT_OUTPUT } from "./defaultData";
import { Questionnaire } from "./components/Questionnaire";
import { NetworkVisualizer } from "./components/NetworkVisualizer";
import { CostCalculator } from "./components/CostCalculator";
import { SystemChecklist } from "./components/SystemChecklist";
import { AdvisorChat } from "./components/AdvisorChat";
import {
  Shield,
  Activity,
  Code,
  CheckCircle,
  TrendingDown,
  Lock,
  Download,
  Terminal,
  FileText,
  Copy,
  FolderTree,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Compass,
  Briefcase,
  Layers,
  Zap,
} from "lucide-react";

// Lightweight markdown renderer to display generated reports beautifully with high-contrast text and zero dependency bloat
const renderSimpleMarkdown = (text: string) => {
  if (!text) return null;
  
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // Heading 3
    if (line.startsWith("### ")) {
      return (
        <h3 key={idx} className="text-sm font-bold text-slate-100 uppercase tracking-wider mt-5 mb-2.5 font-sans border-b border-slate-800 pb-1.5 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          {line.replace("### ", "").replace(/\*\*/g, "")}
        </h3>
      );
    }
    // Heading 4
    if (line.startsWith("#### ")) {
      return (
        <h4 key={idx} className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-4 mb-1.5 font-sans">
          {line.replace("#### ", "").replace(/\*\*/g, "")}
        </h4>
      );
    }
    // Bold / bullet list items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const cleanLine = line.replace(/^[-*]\s+/, "");
      return (
        <li key={idx} className="text-xs text-slate-300 ml-4 mb-2 list-disc leading-relaxed">
          {cleanLine.includes(":") ? (
            <>
              <strong className="text-slate-100 font-medium">{cleanLine.split(":")[0]}:</strong>
              {cleanLine.substring(cleanLine.indexOf(":") + 1)}
            </>
          ) : (
            cleanLine
          )}
        </li>
      );
    }
    // Regular lines with active bold markup formatting
    const isBoldText = line.includes("**");
    return (
      <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-3">
        {isBoldText ? (
          <span>
            {line.split("**").map((part, pIdx) => (pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-semibold">{part}</strong> : part))}
          </span>
        ) : (
          line
        )}
      </p>
    );
  });
};

export default function App() {
  const [inputs, setInputs] = useState<QuestionnaireInputs>(DEFAULT_INPUTS);
  const [output, setOutput] = useState<LandingZoneOutput>(DEFAULT_OUTPUT);
  const [activeTab, setActiveTab] = useState<string>("blueprint");
  const [selectedIacIndex, setSelectedIacIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  
  // Compliance verification list tracking inside state
  const [checklist, setChecklist] = useState<any[]>(DEFAULT_OUTPUT.validationChecklist);

  // loading log items shown inside terminal block
  const [loadingLogIndex, setLoadingLogIndex] = useState<number>(0);
  const loadingLogs = [
    "📡 Establishing safe API proxy handshake...",
    "🔑 Generating dedicated child KMS master keys...",
    "📂 Partitioning multi-account AWS Organizational Units (OU)...",
    "🛡️ Hardening IAM global boundaries and SCP guardrails...",
    "🕸️ Formulating dual-region Transit Gateway routing blocks...",
    "📦 Assembling modular infrastructure resource descriptors...",
    "⚖️ Audit logs linked to immutable object locks...",
    "💯 Finalizing AWS Well-Architected compliance review...",
  ];

  const handleGenerateBlueprint = async () => {
    setIsLoading(true);
    setLoadingLogIndex(0);

    // Simulate real logs pacing in foreground
    const logInterval = setInterval(() => {
      setLoadingLogIndex((prev) => {
        if (prev < loadingLogs.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    try {
      const resp = await fetch("/api/landing-zone/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      if (!resp.ok) {
        throw new Error("Failed to contact generation architect backend API.");
      }

      const parsed = await resp.json();
      if (parsed.executiveSummary) {
        setOutput(parsed);
        // Refresh checklist with new compliance outputs
        if (parsed.validationChecklist) {
          setChecklist(parsed.validationChecklist);
        }
      }
    } catch (err: any) {
      console.error(err);
      // Fallback update to show dynamic generation when API key missing or offline
      alert(`⚠️ Generation API returned an error: ${err.message || 'Unknown'}. Rendering optimized offline blueprint customization instead.`);
      
      // Mimic custom generation locally
      const customOutput = { ...DEFAULT_OUTPUT };
      customOutput.executiveSummary = `### **Custom AWS Landing Zone - Offline Mode** \n\nSuccessfully generated a specialized config for **${inputs.orgName}** in **${inputs.industry}**. Built to align with **${inputs.compliance}** and using **${inputs.iacPreference}**.\n\n- **Compute Engine:** ${inputs.needsK8s ? "EKS Managed Node Groups with Karpenter Autoscaling" : "ECS on Fargate serverless containers"}\n- **Primary Database:** ${inputs.database}\n- **CI/CD Service:** ${inputs.cicdPreference}\n- **AI Stack Active:** ${inputs.needsAI ? "Secure Amazon Bedrock access enabled with Guardrails" : "Standard API orchestration logic"}`;
      setOutput(customOutput);
      setChecklist(customOutput.validationChecklist);
    } finally {
      clearInterval(logInterval);
      setIsLoading(false);
    }
  };

  const handleToggleChecklist = (step: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.step === step ? { ...item, validated: !item.validated } : item))
    );
  };

  // Score computation matching completed checklist steps
  const completedStepsCount = checklist.filter((c) => c.validated).length;
  const totalStepsCount = checklist.length || 1;
  const systemReadyScore = Math.round((completedStepsCount / totalStepsCount) * 100);

  const handleCopyIac = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Top list risks linked to inputs
  const topRisks = [
    {
      risk: "Dynamic Horizontal Scale Lag during peak events",
      vulnerability: "Database pool starvation due to high volume traffic peaks.",
      mitigation: `Autoscale Aurora capacity groups dynamically between limits. Configure AppAutoScaling rules on ECS workloads.`,
      severity: "High",
    },
    {
      risk: "Accidental Audit Log tampering by administrator account",
      vulnerability: "Malicious insider or compromised API key deleting CloudTrail streams.",
      mitigation: "Deploy S3 Write-Once-Read-Many (WORM) active object lock patterns via dedicated CloudFormation structures.",
      severity: "Critical",
    },
    {
      risk: "Cross-region sync lag on Global databases",
      vulnerability: "Dirty reads during database failovers.",
      mitigation: "Strict RPO tuning inside database configuration scopes, backed by health-probe routes.",
      severity: "Medium",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans relative antialiased overflow-x-hidden select-none">
      
      {/* Background static design stars */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.12),transparent_60%)] pointer-events-none" />

      {/* Global Command Hub Shell Header */}
      <header className="sticky top-0 z-30 bg-brand-surface/95 backdrop-blur border-b border-brand-border px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
            <Shield className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-xs font-bold font-mono tracking-wider text-brand-text flex items-center gap-1.5 min-w-max uppercase">
              AWS Landing Zone Architect <span className="text-[10px] text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded font-bold">V4.2</span>
            </h1>
            <p className="text-[10px] text-brand-text-dim font-sans tracking-wide">
              Well-Architected Control Tower Blueprint Suite (2026 Sandbox)
            </p>
          </div>
        </div>

        {/* Live environment dashboard diagnostics tickers */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-brand-text-dim font-mono">
          <div className="text-left border-l border-brand-border pl-4">
            <span className="text-[10px] text-brand-text-dim/60 block uppercase font-sans tracking-wide">Active Target</span>
            <span className="text-brand-text font-semibold">{inputs.orgName || "Acme Enterprise"}</span>
          </div>
          <div className="text-left border-l border-brand-border pl-4">
            <span className="text-[10px] text-brand-text-dim/60 block uppercase font-sans tracking-wide">Audit Standard</span>
            <span className="text-brand-text font-semibold truncate max-w-[120px]">{inputs.compliance || "SOC2"}</span>
          </div>
          <div className="text-left border-l border-brand-border pl-4">
            <span className="text-[10px] text-brand-text-dim/60 block uppercase font-sans tracking-wide">Primary Delivery</span>
            <span className="text-brand-accent font-semibold flex items-center gap-1">
              <Code className="w-3.5 h-3.5" /> {inputs.iacPreference}
            </span>
          </div>
          <div className="text-left border-l border-brand-border pl-4 pr-2">
            <span className="text-[10px] text-brand-text-dim/60 block uppercase font-sans tracking-wide">API Endpoint Guard</span>
            <span className="text-brand-accent font-semibold flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> SEC-PROXY
            </span>
          </div>
        </div>
      </header>

      {/* Main Terminal Loading Screens Overlay if active workspace generating */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-brand-bg/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="max-w-md w-full bg-brand-surface rounded-xl border border-brand-border shadow-2xl p-6 text-left font-mono">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-brand-border">
              <span className="text-xs text-brand-text-dim uppercase tracking-widest font-semibold flex items-center gap-1">
                <Terminal className="w-4 h-4 text-brand-accent animate-spin" /> Control Tower Deployment terminal
              </span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
              </div>
            </div>

            <p className="text-xs text-brand-text-dim leading-relaxed mb-4">
              Analyzing organization requirements... Compiling security parameters, subnet structures, and dynamic billing matrices...
            </p>

            <div className="bg-black border border-brand-border p-4 rounded-lg h-36 overflow-y-auto space-y-1 text-[11px] text-brand-text-dim">
              {loadingLogs.slice(0, loadingLogIndex + 1).map((log, lIdx) => (
                <div key={lIdx} className="flex gap-2 items-start">
                  <span className="text-neutral-650 select-none">&gt;&gt;</span>
                  <span className={lIdx === loadingLogIndex ? "text-brand-accent font-bold" : "text-brand-text"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 text-[10px] text-brand-text-dim text-center">
              Please wait while the AI SRE generates a custom compliant infrastructure stack...
            </div>
          </div>
        </div>
      )}

      {/* Main Work Area Workspace Bento Grid layout */}
      <main className="flex-1 p-5 grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Workspace Tuning questionnaire console */}
        <section id="tuning-console-container" className="col-span-1 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl text-left">
            <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-brand-accent" /> Landing Zone Sculpting Panel
            </h2>
            <p className="text-xs text-brand-text-dim mb-4 font-sans leading-relaxed">
              Design a modern, high-fidelity AWS landing zone customized around your startup or large enterprise compliance posture.
            </p>
            
            <Questionnaire
              inputs={inputs}
              setInputs={setInputs}
              onGenerate={handleGenerateBlueprint}
              isLoading={isLoading}
            />
          </div>

          {/* Quick Pillar Status Cards displays */}
          <div className="grid grid-cols-5 gap-2.5 select-none">
            {Object.entries(output.scores || { operational: 80, security: 80, reliability: 80, performance: 80, cost: 80 }).map(([pillar, val]) => (
              <div key={pillar} className="bg-brand-surface-alt border border-brand-border rounded p-2 text-center">
                <dt className="text-[9px] uppercase font-bold text-brand-text-dim tracking-wide truncate">{pillar}</dt>
                <dd className="text-sm font-extrabold font-mono text-brand-text mt-0.5">{val}%</dd>
                {/* Micro visual progress line */}
                <div className="w-full bg-black rounded-full h-1 mt-1 overflow-hidden">
                  <div
                    className="bg-brand-accent h-1 rounded-full transition-all duration-300"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Fast security advisory warning card */}
          <div className="bg-brand-surface rounded-xl p-4 border border-dashed border-brand-border flex gap-3 text-xs text-brand-text-dim text-left">
            <Zap className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-text block">DevSecOps Active Shield</span>
              <p className="text-brand-text-dim mt-1 leading-relaxed">
                This workbench enforces OIDC-based deployment authentication, denying static IAM security key dumps in local workstation paths.
              </p>
            </div>
          </div>
        </section>

        {/* Right Tabbed Workbench Area */}
        <section id="workbench-active-zone" className="col-span-1 xl:col-span-8 flex flex-col gap-5">
          
          {/* Worktabs navigation bar triggers */}
          <div className="flex bg-brand-surface rounded-xl p-1.5 border border-brand-border shadow-md select-none overflow-x-auto whitespace-nowrap sticky top-14 z-20">
            <button
              onClick={() => setActiveTab("blueprint")}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "blueprint" ? "bg-brand-surface-alt text-brand-accent border border-brand-border shadow-sm" : "text-brand-text-dim hover:text-brand-text hover:bg-brand-surface-alt/45"
              }`}
            >
              <FileText className="w-4 h-4 text-brand-accent" /> Summary Report
            </button>

            <button
              onClick={() => setActiveTab("network")}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "network" ? "bg-brand-surface-alt text-brand-accent border border-brand-border shadow-sm" : "text-brand-text-dim hover:text-brand-text hover:bg-brand-surface-alt/45"
              }`}
            >
              <Compass className="w-4 h-4 text-brand-accent" /> Network Mapping
            </button>

            <button
              onClick={() => setActiveTab("finops")}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "finops" ? "bg-brand-surface-alt text-brand-accent border border-brand-border shadow-sm" : "text-brand-text-dim hover:text-brand-text hover:bg-brand-surface-alt/45"
              }`}
            >
              <Activity className="w-4 h-4 text-brand-accent" /> Cost Allocation
            </button>

            <button
              onClick={() => setActiveTab("iac")}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "iac" ? "bg-brand-surface-alt text-brand-accent border border-brand-border shadow-sm" : "text-brand-text-dim hover:text-brand-text hover:bg-brand-surface-alt/45"
              }`}
            >
              <Code className="w-4 h-4 text-brand-accent" /> IaC Code Vault
            </button>

            <button
              onClick={() => setActiveTab("checklist")}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "checklist" ? "bg-brand-surface-alt text-brand-accent border border-brand-border shadow-sm" : "text-brand-text-dim hover:text-brand-text hover:bg-brand-surface-alt/45"
              }`}
            >
              <CheckCircle className="w-4 h-4 text-brand-accent" /> Verify Stack ({systemReadyScore}%)
            </button>

            <button
              onClick={() => setActiveTab("consulting")}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "consulting" ? "bg-brand-surface-alt text-brand-accent border border-brand-border shadow-sm" : "text-brand-text-dim hover:text-brand-text hover:bg-brand-surface-alt/45"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-brand-accent animate-pulse" /> Ask AI Architect
            </button>
          </div>

          {/* Tab Contents Viewports */}
          <div id="active-tab-viewport">
            
            {/* Tab 1: Blueprint Summary Report */}
            {activeTab === "blueprint" && (
              <div className="space-y-6">
                
                {/* Executive and Architecture summary */}
                <div className="bg-brand-surface rounded-xl p-6 border border-brand-border shadow-xl text-left">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border">
                    <span className="text-xs font-mono font-bold uppercase text-brand-text flex items-center gap-1">
                      <FileText className="w-4 h-4 text-brand-accent" /> Operational Landing Report
                    </span>
                    <span className="text-[10px] text-brand-text-dim">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="prose prose-invert max-w-none text-left font-sans">
                    {renderSimpleMarkdown(output.executiveSummary)}
                  </div>
                </div>

                {/* Key decisions audit cards */}
                <div className="bg-brand-surface rounded-xl p-6 border border-brand-border shadow-xl text-left">
                  <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-2.5">
                    <h3 className="font-bold text-brand-text text-xs uppercase tracking-wide">Key Control Tower Decisions</h3>
                    <span className="text-[10px] text-brand-text-dim font-mono">AWS Well-Architected Framework Check</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {output.keyArchitecturalDecisions?.map((dec, idx) => (
                      <div key={idx} className="p-3.5 bg-brand-surface-alt border border-brand-border rounded-lg hover:border-neutral-700 transition-colors">
                        <span className="text-[10px] bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                          Audit Decision {idx + 1}
                        </span>
                        <h4 className="text-xs text-brand-text font-bold mt-2 leading-snug">{dec.decision}</h4>
                        <p className="text-[11px] text-brand-text-dim mt-1 lines-clamp-3 leading-relaxed">{dec.reason}</p>
                        <hr className="my-2 border-brand-border" />
                        <div className="flex items-center justify-between text-[10px] text-brand-text-dim">
                          <span>FinOps Impact:</span>
                          <span className="text-brand-accent font-mono font-bold uppercase">{dec.costImpact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Risk Matrices */}
                <div className="bg-brand-surface rounded-xl p-6 border border-brand-border shadow-xl text-left">
                  <h3 className="font-bold text-brand-text text-xs uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-brand-accent" /> Active Risks & Mitigation Strategies
                  </h3>
                  <div className="space-y-3">
                    {topRisks.map((tr, idx) => (
                      <div key={idx} className="p-3 bg-brand-surface-alt border border-brand-border rounded-lg flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] uppercase font-bold px-1.5 rounded font-mono ${
                              tr.severity === "Critical" ? "bg-red-500/15 text-red-400 border border-red-500/30" : tr.severity === "High" ? "bg-brand-accent/15 text-brand-accent" : "bg-neutral-800 text-brand-text-dim"
                            }`}>
                              {tr.severity} Risk
                            </span>
                            <span className="text-xs font-semibold text-brand-text">{tr.risk}</span>
                          </div>
                          <p className="text-[11px] text-brand-text-dim mt-1 leading-relaxed max-w-2xl">
                            {tr.vulnerability}
                          </p>
                        </div>
                        <div className="md:text-right shrink-0 font-mono">
                          <span className="text-[10px] uppercase text-brand-accent font-bold font-sans">Remediation Active</span>
                          <span className="text-[11px] text-brand-text-dim block max-w-xs md:text-right italic mt-0.5">
                            {tr.mitigation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Subnet mapping */}
            {activeTab === "network" && (
              <div id="subnets-active-tab" className="space-y-6">
                <NetworkVisualizer
                  subnets={output.subnetsDesign || []}
                  explanation={output.networkExplanation || ""}
                />
                
                <div className="bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl text-left">
                  <h3 className="font-bold text-brand-text text-xs mb-3 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-brand-accent" /> VPC Routing Policy & Inspection Logic
                  </h3>
                  <div className="prose prose-invert max-w-none text-left">
                    {renderSimpleMarkdown(output.networkExplanation || "Custom micro-segment explanation compiled.")}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: FinOps breakdown */}
            {activeTab === "finops" && (
              <CostCalculator initialCosts={output.costEstimate || []} />
            )}

            {/* Tab 4: IaC Files */}
            {activeTab === "iac" && (
              <div className="bg-brand-surface rounded-xl border border-brand-border shadow-xl overflow-hidden flex flex-col">
                
                {/* Sub repositories navigation list */}
                <div className="bg-brand-surface-alt border-b border-brand-border px-4 py-2 flex items-center justify-between flex-wrap gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4 text-brand-accent" />
                    <span className="text-xs font-mono text-brand-text font-bold">AWS Landing Zone Infrastructure Repository</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs select-none">
                    {output.iacFiles?.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => setSelectedIacIndex(fIdx)}
                        className={`px-3 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                          selectedIacIndex === fIdx ? "bg-brand-surface text-brand-accent border-brand-border" : "text-brand-text-dim border-transparent hover:text-brand-text"
                        }`}
                      >
                        {f.filename}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main IaC Source Viewport */}
                {output.iacFiles?.[selectedIacIndex] ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[480px]">
                    
                    {/* HCL/YAML details card */}
                    <div className="p-5 border-b lg:border-b-0 lg:border-r border-brand-border bg-black/20 text-left flex flex-col justify-between">
                      <div>
                        <div className="px-2 py-1 bg-brand-surface border border-brand-border rounded inline-block mb-3">
                          <span className="text-[10px] text-brand-text-dim font-mono tracking-wide uppercase">Active Asset</span>
                        </div>
                        
                        <h4 className="text-sm font-bold text-white mb-2 font-mono">
                          {output.iacFiles[selectedIacIndex].filename}
                        </h4>
                        
                        <p className="text-xs text-brand-text-dim leading-relaxed mb-4">
                          {output.iacFiles[selectedIacIndex].explanation}
                        </p>
 
                        <div className="bg-black p-2.5 rounded border border-brand-border text-[11px] text-brand-text-dim font-mono">
                          Format: <span className="text-brand-accent font-bold uppercase">{output.iacFiles[selectedIacIndex].language}</span> <br />
                          Path: <span className="text-brand-text block select-all">./infra/{output.iacFiles[selectedIacIndex].filename}</span>
                        </div>
                      </div>

                      {/* Control panel buttons group */}
                      <div className="pt-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleCopyIac(output.iacFiles[selectedIacIndex].code)}
                          className="w-full py-1.5 bg-brand-accent hover:opacity-90 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copyFeedback ? "Code Copied to Clipboard!" : "Copy Source File"}
                        </button>
                      </div>
                    </div>

                    {/* Source Code Box formatted */}
                    <div className="lg:col-span-2 bg-black p-4 font-mono text-xs overflow-x-auto relative min-h-[300px] text-left border-l border-brand-border/20">
                      <pre className="text-brand-text-dim leading-relaxed relative z-10 block whitespace-pre">
                        <code>{output.iacFiles[selectedIacIndex].code}</code>
                      </pre>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center text-brand-text-dim">
                    No active infrastructure code descriptors found in this repository scope.
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Interactive Verification checklist */}
            {activeTab === "checklist" && (
              <SystemChecklist
                checklist={checklist}
                onChecklistItemToggle={handleToggleChecklist}
                productionReadyScore={systemReadyScore}
              />
            )}

            {/* Tab 6: Interactive Architect chatbot */}
            {activeTab === "consulting" && (
              <AdvisorChat inputs={inputs} />
            )}

          </div>

          {/* Quick Footer Summary */}
          <footer className="mt-8 pt-5 border-t border-brand-border text-center text-[11px] text-brand-text-dim flex flex-wrap items-center justify-between gap-4">
            <span>Enterprise AWS Architecture Workbench (HIPAA-PCI Suite). Generated on best available metadata.</span>
            <div className="flex items-center gap-3 font-mono">
              <a href="https://aws.amazon.com/well-architected/" target="_blank" rel="noreferrer" className="hover:text-brand-text flex items-center gap-1">
                AWS Framework <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a href="https://aws.amazon.com/controltower/" target="_blank" rel="noreferrer" className="hover:text-brand-text flex items-center gap-1">
                Control Tower <ExternalLink className="w-3 h-3 text-brand-accent" />
              </a>
            </div>
          </footer>

        </section>

      </main>

    </div>
  );
}
