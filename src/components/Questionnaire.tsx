import React from "react";
import { QuestionnaireInputs } from "../types";
import { Sliders, Sparkles, Building, Briefcase, Users, Cpu, Database, Save, Server, Globe } from "lucide-react";

interface QuestionnaireProps {
  inputs: QuestionnaireInputs;
  setInputs: React.Dispatch<React.SetStateAction<QuestionnaireInputs>>;
  onGenerate: () => void;
  isLoading: boolean;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  inputs,
  setInputs,
  onGenerate,
  isLoading,
}) => {
  // Scenario selector presets to prepopulate immediately
  const handleApplyPreset = (preset: string) => {
    switch (preset) {
      case "saas":
        setInputs({
          orgName: "Initech SaaS",
          industry: "SaaS & CRM Security",
          teamSize: "32 Engineers",
          compliance: "SOC2, GDPR",
          iacPreference: "Terraform",
          workloadType: "Multi-tenant SaaS Client Stack",
          traffic: "Medium (5M - 20M requests/mo)",
          budget: "$2,000 - $6,000 / month",
          multiRegion: false,
          cicdPreference: "GitHub Actions",
          database: "Aurora Serverless v2 PostgreSQL",
          needsK8s: false,
          needsAI: false,
          hasAccount: true,
        });
        break;
      case "fintech":
        setInputs({
          orgName: "PayGuard Financial",
          industry: "Digital Banking & Payments",
          teamSize: "120 Engineers",
          compliance: "PCI-DSS, SOC2, ISO27001",
          iacPreference: "Terraform",
          workloadType: "Microservices & Secure API",
          traffic: "High (100M+ requests/mo)",
          budget: "$15,000 - $50,000 / month",
          multiRegion: true,
          cicdPreference: "GitLab CI",
          database: "RDS Aurora with Global DB replications",
          needsK8s: true,
          needsAI: true,
          hasAccount: true,
        });
        break;
      case "healthcare":
        setInputs({
          orgName: "Helio Health Labs",
          industry: "Healthcare & AI Biotech",
          teamSize: "18 Engineers",
          compliance: "HIPAA, SOC2-Type2",
          iacPreference: "CloudFormation",
          workloadType: "AI-assisting Medical Image Analysers",
          traffic: "Low (Under 1M requests/mo)",
          budget: "$1,500 - $4,000 / month",
          multiRegion: false,
          cicdPreference: "AWS CodePipeline",
          database: "DynamoDB Encrypted with KMS CMK",
          needsK8s: false,
          needsAI: true,
          hasAccount: false,
        });
        break;
      default:
        break;
    }
  };

  const handleInputChange = (field: keyof QuestionnaireInputs, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div id="questionnaire-component" className="bg-brand-surface rounded-xl p-6 border border-brand-border shadow-2xl text-left select-none">
      
      {/* Preset scenario selection row */}
      <div className="mb-6 pb-5 border-b border-brand-border">
        <span className="text-xs uppercase text-brand-text-dim font-bold tracking-wider block mb-3 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent" /> One-Click Architectural Preset Scenarios:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleApplyPreset("saas")}
            className="px-3 py-2 bg-brand-surface-alt border border-brand-border rounded-lg hover:border-brand-accent hover:bg-brand-surface transition-all font-medium text-xs text-brand-text-dim text-left flex items-start gap-2 cursor-pointer"
          >
            <Server className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block text-white text-[11px]">SaaS Startup Blueprint</span>
              <span className="text-[10px] text-brand-text-dim block leading-tight">SOC2 • ECS Compute • PG Aurora</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset("fintech")}
            className="px-3 py-2 bg-brand-surface-alt border border-brand-border rounded-lg hover:border-brand-accent hover:bg-brand-surface transition-all font-medium text-xs text-brand-text-dim text-left flex items-start gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block text-white text-[11px]">PCI FinTech Core Platform</span>
              <span className="text-[10px] text-brand-text-dim block leading-tight">PCI-DSS • Multi-Region EKS • Global DB</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset("healthcare")}
            className="px-3 py-2 bg-brand-surface-alt border border-brand-border rounded-lg hover:border-brand-accent hover:bg-brand-surface transition-all font-medium text-xs text-brand-text-dim text-left flex items-start gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block text-white text-[11px]">HIPAA Medical AI Service</span>
              <span className="text-[10px] text-brand-text-dim block leading-tight">HIPAA compliant • DynamoDB • Bedrock AI</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="space-y-4">
        <h4 className="text-xs uppercase text-brand-text-dim font-bold tracking-wider mb-2">Custom Subnet & Profile Tuning</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Org Name */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-brand-text-dim/60" /> Organization Name
            </label>
            <input
              type="text"
              value={inputs.orgName}
              onChange={(e) => handleInputChange("orgName", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-brand-bg rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20"
              placeholder="e.g. Acme Enterprise"
              required
            />
          </div>

          {/* Industry */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-brand-text-dim/60" /> Organizational Industry
            </label>
            <input
              type="text"
              value={inputs.industry}
              onChange={(e) => handleInputChange("industry", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-brand-bg rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20"
              placeholder="e.g. Financial SaaS"
              required
            />
          </div>

          {/* Team Size */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-text-dim/60" /> Team Size
            </label>
            <input
              type="text"
              value={inputs.teamSize}
              onChange={(e) => handleInputChange("teamSize", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-brand-bg rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none"
              placeholder="e.g. 20 Cloud Ops Engineers"
            />
          </div>

          {/* Compliance */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-brand-text-dim/60" /> Required Compliances
            </label>
            <input
              type="text"
              value={inputs.compliance}
              onChange={(e) => handleInputChange("compliance", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-brand-bg rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none"
              placeholder="e.g. SOC2, HIPAA, GDPR"
            />
          </div>

          {/* Traffic */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold">traffic Scope / volume</label>
            <input
              type="text"
              value={inputs.traffic}
              onChange={(e) => handleInputChange("traffic", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-brand-bg rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none"
              placeholder="e.g. 50M requests/mo"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold">Tuning Budget Range</label>
            <input
              type="text"
              value={inputs.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-brand-bg rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none"
              placeholder="e.g. $5,000/mo"
            />
          </div>

          {/* Preferred IaC */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold">IaC Delivery Mechanism</label>
            <select
              value={inputs.iacPreference}
              onChange={(e) => handleInputChange("iacPreference", e.target.value)}
              className="w-full px-3 py-1.5 bg-brand-bg text-xs text-brand-text rounded border border-brand-border focus:border-brand-accent focus:outline-none"
            >
              <option value="Terraform">Terraform Module Stack (Recommended)</option>
              <option value="AWS CDK">Cloud Development Kit (TypeScript)</option>
              <option value="CloudFormation">AWS CloudFormation Native Template</option>
            </select>
          </div>

          {/* Workload Type */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold">Workload Core Ecosystem</label>
            <input
              type="text"
              value={inputs.workloadType}
              onChange={(e) => handleInputChange("workloadType", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-brand-bg rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none"
              placeholder="e.g. REST API Containers"
            />
          </div>

          {/* Database choice */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-brand-text-dim/60" /> Targeted Storage Layer
            </label>
            <input
              type="text"
              value={inputs.database}
              onChange={(e) => handleInputChange("database", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-brand-bg rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none"
              placeholder="e.g. Aurora PostgreSQL Serverless v2"
            />
          </div>

          {/* CI/CD orchestrator */}
          <div>
            <label className="text-xs text-brand-text-dim block mb-1 font-semibold">CI-CD pipeline Engine</label>
            <select
              value={inputs.cicdPreference}
              onChange={(e) => handleInputChange("cicdPreference", e.target.value)}
              className="w-full px-3 py-1.5 bg-brand-bg text-xs text-brand-text rounded border border-brand-border focus:border-brand-accent focus:outline-none"
            >
              <option value="GitHub Actions">GitHub Secure OIDC Pipelines</option>
              <option value="GitLab CI">GitLab Continuous Integration</option>
              <option value="AWS CodePipeline">Native AWS CodePipeline Orchestrator</option>
            </select>
          </div>

        </div>

        {/* Dynamic Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 pb-2">
          
          <label className="flex items-center gap-2.5 cursor-pointer bg-brand-surface-alt p-2.5 rounded border border-brand-border select-none hover:border-brand-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={inputs.multiRegion}
              onChange={(e) => handleInputChange("multiRegion", e.target.checked)}
              className="w-4 h-4 rounded bg-brand-bg cursor-pointer accent-brand-accent"
            />
            <div className="text-left">
              <span className="text-xs text-brand-text font-semibold block">Multi-Region HA</span>
              <span className="text-[10px] text-brand-text-dim block">Cross-region replicas</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer bg-brand-surface-alt p-2.5 rounded border border-brand-border select-none hover:border-brand-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={inputs.needsK8s}
              onChange={(e) => handleInputChange("needsK8s", e.target.checked)}
              className="w-4 h-4 rounded bg-brand-bg cursor-pointer accent-brand-accent"
            />
            <div className="text-left">
              <span className="text-xs text-brand-text font-semibold block">EKS Cluster</span>
              <span className="text-[10px] text-brand-text-dim block">Need Kubernetes pods?</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer bg-brand-surface-alt p-2.5 rounded border border-brand-border select-none hover:border-brand-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={inputs.needsAI}
              onChange={(e) => handleInputChange("needsAI", e.target.checked)}
              className="w-4 h-4 rounded bg-brand-bg cursor-pointer accent-brand-accent"
            />
            <div className="text-left">
              <span className="text-xs text-brand-text font-semibold block">Bedrock AI integration</span>
              <span className="text-[10px] text-brand-text-dim block">Secure prompt guards</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer bg-brand-surface-alt p-2.5 rounded border border-brand-border select-none hover:border-brand-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={inputs.hasAccount}
              onChange={(e) => handleInputChange("hasAccount", e.target.checked)}
              className="w-4 h-4 rounded bg-brand-bg cursor-pointer accent-brand-accent"
            />
            <div className="text-left">
              <span className="text-xs text-brand-text font-semibold block">Active AWS Accounts</span>
              <span className="text-[10px] text-brand-text-dim block">Deploying to live root?</span>
            </div>
          </label>

        </div>

        {/* Generate / Submit Button trigger */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent hover:opacity-95 text-white rounded-lg font-bold text-xs shadow-lg shadow-brand-accent/15 border border-brand-accent/20 disabled:opacity-50 transition-all font-sans cursor-pointer uppercase tracking-wider"
          >
            <Cpu className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Provisioning landing design blueprint..." : "Build customized AWS Landing Zone blueprint"}
          </button>
        </div>

      </form>
    </div>
  );
};
