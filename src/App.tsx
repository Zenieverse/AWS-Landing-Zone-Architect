import React, { useState, useEffect } from "react";
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
  Cpu,
  Play,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  Wrench,
} from "lucide-react";

// Predefined high-compliance SRE optimization recipes for Kiro IDE & Claude Code
const AGENT_RECIPES: Record<string, { label: string; refactoredCode: string }[]> = {
  "providers.tf": [
    {
      label: "Harden state locking and enable KMS-CMK encrypted state backends",
      refactoredCode: `# Refactored by Kiro IDE with PCI-DSS & HIPAA compliance constraint keys
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50.0" # Hardened provider locks dynamically verified by Kiro IDE
    }
  }
  backend "s3" {
    bucket         = "acme-enterprise-tf-state-prod"
    key            = "landing-zone/core-networking/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "acme-enterprise-tf-state-lock"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-east-1:112233445566:key/state-bucket-encryption-cmk"
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Environment   = "Production"
      Owner         = "SRE-CloudOps"
      Compliance    = "SOC2-HIPAA-PCI"
      Provisioner   = "KiroIDE-AgenticEngine"
      SecurityAudit = "ActiveControlTower"
    }
  }
}`
    },
    {
      label: "Inject AWS IAM Security Token federated SAML roles for child OUs",
      refactoredCode: `# Refactored by Claude Code - SAML integration
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  assume_role {
    role_arn     = "arn:aws:iam::112233445566:role/KiroEnterpriseOidcDeploymentRole"
    session_name = "AgenticSRESession"
  }
  default_tags {
    tags = {
      Environment = "Production"
      Owner       = "SRE-CloudOps"
      Compliance  = "SAML-OIDC-Enforced"
      Provisioner = "ClaudeCode-Agent"
    }
  }
}`
    }
  ],
  "main.tf": [
    {
      label: "Inject secure Multi-AZ Transit Gateway (TGW) cross-account routing peering",
      refactoredCode: `# Refactored by Kiro IDE - Transit Gateway Architecture addition
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5"

  name = "acme-prod-vpc"
  cidr = "10.100.0.0/16"

  azs              = ["us-east-1a", "us-east-1b"]
  public_subnets   = ["10.100.1.0/24", "10.100.2.0/24"]
  private_subnets  = ["10.100.10.0/22", "10.100.20.0/22"]
  database_subnets = ["10.100.100.0/24", "10.100.101.0/24"]

  create_database_subnet_group       = true
  create_database_subnet_route_table = true
  enable_dns_hostnames               = true
  enable_dns_support                 = true

  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true

  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role  = true
  
  vpc_tags = {
    Classification = "Confidential"
    TgwAttached    = "true"
  }
}

# Multi-Account Transit Gateway peering for zero-trust private link segregation
resource "aws_ec2_transit_gateway" "tgw" {
  description                     = "Acme Core Transit Hub"
  default_route_table_association = "enable"
  default_route_table_propagation = "enable"
  dns_support                     = "enable"
  vpn_ecmp_support                = "enable"
  
  tags = {
    Name             = "acme-core-tgw"
    ProvisionedBySRE = "KiroIDE"
  }
}

resource "aws_ec2_transit_gateway_vpc_attachment" "vpc_assoc" {
  subnet_ids         = module.vpc.private_subnets
  transit_gateway_id = aws_ec2_transit_gateway.tgw.id
  vpc_id             = module.vpc.vpc_id
}`
    },
    {
      label: "Enforce VPC Flow Logs write targets to locked immutable CloudWatch logs",
      refactoredCode: `# Refactored by Claude Code - Audited Flow Log Schema
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5"

  name = "acme-prod-vpc"
  cidr = "10.100.0.0/16"

  azs              = ["us-east-1a", "us-east-1b"]
  public_subnets   = ["10.100.1.0/24", "10.100.2.0/24"]
  private_subnets  = ["10.100.10.0/22", "10.100.20.0/22"]
  database_subnets = ["10.100.100.0/24", "10.100.101.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true # Optimized for cost with continuous inspection

  # CloudWatch Immutable Flow Logs configuration
  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role  = true
  flow_log_max_aggregation_interval    = 60
  
  vpc_tags = {
    DeploymentTarget = "SecurityAuditReady"
  }
}

resource "aws_cloudwatch_log_resource_policy" "strict_policy" {
  policy_name = "allow-flow-logs-write"
  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
      }
    ]
  })
}`
    }
  ],
  "active-guardrails.tf": [
    {
      label: "Implement Amazon Web Application Firewall (WAFv2) IP-rate limiting and OWASP rules",
      refactoredCode: `# Refactored by Kiro IDE - Enterprise OWASP & WAF Core Guards
resource "aws_wafv2_web_acl" "ingress_firewall" {
  name        = "acme-ingress-owasp-shield"
  description = "OWASP Top 10 web ACL protection with active rate-limiting rule bounds config."
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # Active IP rate throttling limit
  rule {
    name     = "IPRateLimitRule"
    priority = 10
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = 1000 # Throttling cap implemented by Kiro IDE
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "IPRateLimitMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "acmeWafCoreMetric"
    sampled_requests_enabled   = true
  }
}`
    },
    {
      label: "Configure multi-region KMS key replicas with dynamic disaster recovery routes",
      refactoredCode: `# Refactored by Claude Code - Dynamic Cross-Region Key replicas
resource "aws_kms_replica_key" "backup_key" {
  provider                = aws # Bind to dynamic secondary region
  description             = "Multi-Region Replica KMS CMK Key for Cross-Region Disaster Recovery"
  primary_key_arn         = aws_kms_key.audit_log_key.arn
  deletion_window_in_days = 30
  
  tags = {
    DisasterRecovery = "PrimaryReplica"
    ConfiguredBy     = "ClaudeCode-Agent"
  }
}

# Multi-region failover S3 replica policy with write object restriction
resource "aws_s3_bucket" "dr_audit_bucket" {
  bucket              = "acme-enterprise-secure-audit-logs-replica"
  object_lock_enabled = true
}`
    }
  ],
  "pipeline.yml": [
    {
      label: "Inject automated static security tflint & Checkov assessment pipeline scanning",
      refactoredCode: `# Refactored by Kiro IDE - Dual-pipeline Checkov Compliance Audits
name: "IaC Security Scan & Continuous Deployment"

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

permissions:
  id-token: write
  contents: read
  security-events: write # Permitted lock write for CodeQL logs

jobs:
  tf-audit:
    name: "Static Code Deep Scan"
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run Checkov Security Assessment
        uses: bridgecrewio/checkov-action@master
        with:
          framework: terraform
          output_format: cli
          soft_fail: false # Hard stop pipeline on vulnerabilities

      - name: Run tfsec Vulnerability Analyzer
        uses: aquasecurity/tfsec-action@v1.0.0
        with:
          soft_fail: false

  tf-deploy:
    name: "Enterprise Planning & Apply"
    needs: tf-audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.4"`
    },
    {
      label: "Add automated signed artifact container signatures validation checks via Cosign",
      refactoredCode: `# Refactored by Claude Code - Cosign container signatures
name: "IaC Security Scan & Continuous Deployment"

on:
  push:
    branches: [ "main" ]

jobs:
  ci-cosign-verify:
    name: "Verify Container Signatures"
    runs-on: ubuntu-latest
    steps:
      - name: Install Cosign CLI tool
        uses: sigstore/cosign-installer@v3.4.0

      - name: Authenticate OIDC Container Registry
        run: |
          echo "Assuming federated registry keys..."
          cosign verify --key aws://key-id-or-arn register-uri/acme-service:latest

  tf-deploy:
    name: "Planning & Apply"
    needs: ci-cosign-verify
    runs-on: ubuntu-latest
    steps:
      - name: Execute terraform apply
        run: echo "Applied checked verified containers successfully."`
    }
  ]
};

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

  // Agentic SRE Coding Workspace states
  const [selectedAgent, setSelectedAgent] = useState<string>("kiro");
  const [selectedOptimGoal, setSelectedOptimGoal] = useState<string>("");
  const [customAgentPrompt, setCustomAgentPrompt] = useState<string>("# Optimize resource limits for production-ready reliability");
  const [agentTerminalLogs, setAgentTerminalLogs] = useState<string[]>([
    "💡 Kiro IDE Core: Sandbox terminal initialized. Select an optimization goal or type prompts above."
  ]);
  const [isAgentSpinning, setIsAgentSpinning] = useState<boolean>(false);
  const [isBackupRestorable, setIsBackupRestorable] = useState<boolean>(false);
  const [agentApiKey, setAgentApiKey] = useState<string>("sk-SbR61GRDMhXpIgKbZpXVEqWa56490_HsQxy8zF-2m6Dk8D2DNwzzZaT6fsVUA8ml");
  const [sshDeployKey, setSshDeployKey] = useState<string>("MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCX4dK5w/R8jdUxBJyMCBVmvIE28pBlprPw/wV73TsAe4lQZBNxYFpJ2MwKCY74rT+vFAMHdr7UZmfa6ZlYfni5esNuqO5pTpWDmhqh+msc4EnvW7Gai1juj//vhx/eKpShBH2HVTJaM2ahOyhy3KwIQcSl0+0B1bAubojXhsQ1uQIDAQAB");
  const [apiKeyCopied, setApiKeyCopied] = useState<boolean>(false);
  const [sshKeyCopied, setSshKeyCopied] = useState<boolean>(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(agentApiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handleCopySshKey = () => {
    navigator.clipboard.writeText(sshDeployKey);
    setSshKeyCopied(true);
    setTimeout(() => setSshKeyCopied(false), 2000);
  };

  // Synchronize base goals when active file shifts
  useEffect(() => {
    const activeFile = output.iacFiles?.[selectedIacIndex];
    if (activeFile && AGENT_RECIPES[activeFile.filename]) {
      setSelectedOptimGoal(AGENT_RECIPES[activeFile.filename][0].label);
    } else {
      setSelectedOptimGoal("custom");
    }
  }, [selectedIacIndex, output.iacFiles]);

  const handleDeployAgent = () => {
    if (isAgentSpinning) return;
    
    setIsAgentSpinning(true);
    const activeFile = output.iacFiles?.[selectedIacIndex];
    if (!activeFile) return;

    const filename = activeFile.filename;
    const isCustom = selectedOptimGoal === "custom";
    const promptText = isCustom ? (customAgentPrompt || "Optimize files structure") : selectedOptimGoal;
    
    const agentNameLabel = selectedAgent === "kiro" 
      ? "Kiro IDE v1.8 (SRE)" 
      : selectedAgent === "claude" 
      ? "Claude Code CLI" 
      : selectedAgent === "cursor" 
      ? "Cursor Composer" 
      : "Copilot Workspace";

    const slicedApiKey = agentApiKey.substring(0, 10) + "..." + agentApiKey.substring(agentApiKey.length - 10);
    const slicedSshKey = sshDeployKey.substring(0, 15) + "..." + sshDeployKey.substring(sshDeployKey.length - 15);

    const logs = selectedAgent === "kiro" ? [
      `[${agentNameLabel}] 🛰️ Spawning secure agentic subprocess on thread-pool...`,
      `[${agentNameLabel}] 🔐 Initializing assistant scope with key [${slicedApiKey}]... [AUTHENTICATED]`,
      `[${agentNameLabel}] 🔑 Handshaking with secure SRE endpoint using deploy certificate [${slicedSshKey}]...`,
      `[${agentNameLabel}] 📁 Mapping codebase context: loading ./infra/${filename}...`,
      `[${agentNameLabel}] ⚙️ Executing deep static analysis on draft schema...`,
      `[${agentNameLabel}] 🔥 Refactoring schema to satisfy instructions: "${promptText}"...`,
      `[${agentNameLabel}] 🛡️ Running Bridgecrew/Checkov dry-run compliance checks... [PASSED]`,
      `[${agentNameLabel}] ⚡ Injecting optimized code blocks and updating AST structure...`,
      `[${agentNameLabel}] 📝 Diff patch successfully applied! Overwriting file ./infra/${filename}.`,
      `[${agentNameLabel}] 💯 Refactoring complete! Security readiness audit score increased.`
    ] : [
      `[${agentNameLabel}] $ executing agent edit command on ./infra/${filename}`,
      `[${agentNameLabel}] 🔐 Active Assistant Key Verified: [${slicedApiKey}]`,
      `[${agentNameLabel}] 🛡️ Cryptographic Sign Token Verified: [${slicedSshKey}]`,
      `[${agentNameLabel}] 🔍 Indexing workspace definitions for active-guardrails & main modules...`,
      `[${agentNameLabel}] 📝 Formulating code delta matching context parameters...`,
      `[${agentNameLabel}] ⚡ Appending specialized configurations for: "${promptText}"`,
      `[${agentNameLabel}] ⚙️ executing local parsing test validation... [OK]`,
      `[${agentNameLabel}] 📝 Overwriting destination file... done.`,
      `[${agentNameLabel}] ✔️ Process success. Applied secure patches.`
    ];

    setAgentTerminalLogs([logs[0]]);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < logs.length) {
        setAgentTerminalLogs((prev) => [...prev, logs[currentStep]]);
      } else {
        clearInterval(interval);
        setIsAgentSpinning(false);
        setIsBackupRestorable(true);
        
        // Actually overwrite code!
        let finalCode = "";
        const matchedRecipe = AGENT_RECIPES[filename]?.find(r => r.label === selectedOptimGoal);
        if (matchedRecipe && !isCustom) {
          finalCode = matchedRecipe.refactoredCode;
        } else {
          // Custom generator: append a header with custom prompt and subtle edits
          const prefix = selectedAgent === "kiro" 
            ? `# -----------------------------------------------------\n# AUTO-OPTIMIZED BY KIRO IDE SRE AUTO-CODER ENGINE\n# Prompt: "${promptText}"\n# Verification status: Compiles perfectly, SEC-GUARD active.\n# -----------------------------------------------------\n\n`
            : `# -----------------------------------------------------\n# GENERATED BY CLAUDE CODE ASSISTANT ENGINE\n# Task target: "${promptText}"\n# Operational compliance status: SECURE\n# -----------------------------------------------------\n\n`;
          finalCode = prefix + activeFile.code;
        }

        // Apply changes to the active state representation
        setOutput(prev => {
          const updatedFiles = [...prev.iacFiles];
          updatedFiles[selectedIacIndex] = {
            ...updatedFiles[selectedIacIndex],
            code: finalCode,
            explanation: `This file was interactively optimized by ${agentNameLabel} to implement: ${promptText}. Code compiles and security lints successfully.`
          };
          return {
            ...prev,
            iacFiles: updatedFiles,
            scores: {
              ...prev.scores,
              operational: Math.min(100, prev.scores.operational + 3),
              security: Math.min(100, prev.scores.security + 2),
            }
          };
        });
      }
    }, 400);
  };

  const handleResetIacCode = () => {
    setOutput((prev) => ({
      ...prev,
      iacFiles: DEFAULT_OUTPUT.iacFiles.map(f => ({ ...f })), // deep copy elements
      scores: {
        ...prev.scores,
        operational: DEFAULT_OUTPUT.scores.operational,
        security: DEFAULT_OUTPUT.scores.security,
      }
    }));
    setIsBackupRestorable(false);
    setSelectedIacIndex(0);
    setAgentTerminalLogs([
      "💡 Sandbox repository reset completed. Original golden master templates restored."
    ]);
  };

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
              <div className="space-y-6">
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
                          onClick={() => {
                            setSelectedIacIndex(fIdx);
                          }}
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
                            className="w-full py-1.5 bg-brand-accent hover:opacity-90 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-0 shadow-sm"
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

                {/* Integration of Kiro IDE and other Agentic Coding Assistants */}
                <div className="bg-brand-surface rounded-xl border border-brand-border shadow-2xl p-5 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-brand-border pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4.5 h-4.5 text-brand-accent" />
                      <div>
                        <h3 className="font-bold text-brand-text text-sm">Agentic SRE Co-Developer Suite</h3>
                        <p className="text-[10px] text-brand-text-dim">Deploy agentic assistants to target and modify code modules.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-brand-accent/20">
                      <div className={`w-2 h-2 rounded-full ${isAgentSpinning ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}></div>
                      {isAgentSpinning ? "Agent Executing" : "Agent Standby"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left control panel params */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Assistant Selector */}
                      <div>
                        <label className="text-[10px] text-brand-text-dim/80 font-bold uppercase tracking-wider block mb-1.5">
                          1️⃣ Target Coding Assistant
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedAgent("kiro")}
                            className={`p-2 rounded border transition-all text-left flex items-center justify-between ${
                              selectedAgent === "kiro"
                                ? "bg-brand-accent/15 text-brand-accent border-brand-accent font-bold"
                                : "bg-brand-surface-alt text-brand-text-dim border-brand-border hover:bg-neutral-800"
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5" /> Kiro IDE (Default)
                            </span>
                            {selectedAgent === "kiro" && <span className="text-[9px] bg-brand-accent text-white px-1 rounded uppercase font-bold">ACTV</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAgent("claude")}
                            className={`p-2 rounded border transition-all text-left flex items-center justify-between ${
                              selectedAgent === "claude"
                                ? "bg-orange-500/15 text-orange-400 border-orange-500 font-bold"
                                : "bg-brand-surface-alt text-brand-text-dim border-brand-border hover:bg-neutral-800"
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <Cpu className="w-3.5 h-3.5" /> Claude Code
                            </span>
                            {selectedAgent === "claude" && <span className="text-[9px] bg-orange-500 text-white px-1 rounded uppercase font-bold">ACTV</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAgent("cursor")}
                            className={`p-2 rounded border transition-all text-left flex items-center justify-between ${
                              selectedAgent === "cursor"
                                ? "bg-sky-500/15 text-sky-400 border-sky-500 font-bold"
                                : "bg-brand-surface-alt text-brand-text-dim border-brand-border hover:bg-neutral-800"
                            }`}
                          >
                            <span className="flex items-center gap-1 text-xs truncate">
                              <Wrench className="w-3.5 h-3.5" /> Cursor Composer
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAgent("copilot")}
                            className={`p-2 rounded border transition-all text-left flex items-center justify-between ${
                              selectedAgent === "copilot"
                                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500 font-bold"
                                : "bg-brand-surface-alt text-brand-text-dim border-brand-border hover:bg-neutral-800"
                            }`}
                          >
                            <span className="flex items-center gap-1 text-xs truncate">
                              <Sparkles className="w-3.5 h-3.5" /> Copilot
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Goal / Macro Selector */}
                      <div>
                        <label className="text-[10px] text-brand-text-dim/80 font-bold uppercase tracking-wider block mb-1">
                          2️⃣ Select Optimization Strategy
                        </label>
                        <select
                          value={selectedOptimGoal}
                          onChange={(e) => setSelectedOptimGoal(e.target.value)}
                          className="w-full bg-brand-bg text-xs border border-brand-border rounded p-2 focus:outline-none focus:border-brand-accent text-brand-text"
                          disabled={isAgentSpinning}
                        >
                          {AGENT_RECIPES[output.iacFiles?.[selectedIacIndex]?.filename]?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt.label}>
                              ✨ {opt.label}
                            </option>
                          ))}
                          <option value="custom">✍️ Type a custom agentic instruction...</option>
                        </select>
                      </div>

                      {/* Custom freeform prompt */}
                      {selectedOptimGoal === "custom" && (
                        <div className="animate-fadeIn">
                          <label className="text-[10px] text-brand-text-dim/80 font-bold uppercase tracking-wider block mb-1">
                            💬 Custom Instruction Prompts for SRE Agent
                          </label>
                          <textarea
                            value={customAgentPrompt}
                            onChange={(e) => setCustomAgentPrompt(e.target.value)}
                            placeholder="# Enter custom directives (e.g., Introduce cross-region read-replicas for higher availability)"
                            rows={2}
                            className="w-full bg-brand-bg text-[11px] border border-brand-border rounded p-2 text-brand-text focus:outline-none focus:border-brand-accent font-mono resize-none leading-relaxed"
                            disabled={isAgentSpinning}
                          />
                        </div>
                      )}

                      {/* Action Triggers */}
                      <div className="flex gap-2 pt-1 font-mono">
                        <button
                          type="button"
                          onClick={handleDeployAgent}
                          disabled={isAgentSpinning}
                          className="flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-white cursor-pointer bg-brand-accent hover:opacity-90 disabled:opacity-40 border-0"
                        >
                          {isAgentSpinning ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Refactoring Code...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              Run Agentic Optimization Loop
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleResetIacCode}
                          disabled={isAgentSpinning || !isBackupRestorable}
                          className="py-2 px-3 border border-brand-border hover:bg-brand-surface-alt/80 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-brand-text-dim hover:text-brand-text cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          title="Restore golden master default codebase templates"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Restore Default
                        </button>
                      </div>
                    </div>

                    {/* Right active simulation console screen */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-brand-text-dim font-mono mb-1">
                          <span className="uppercase font-semibold flex items-center gap-1">
                            <Terminal className="w-3.5 h-3.5 text-brand-accent" /> Active SRE Subprocess Monitor
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {selectedAgent === "kiro" ? "Kiro v1.8-Core" : "Claude CLI Session"}
                          </span>
                        </div>

                        {/* Interactive black logs frame */}
                        <div className="bg-black/95 rounded-lg border border-brand-border p-4.5 font-mono text-[11px] leading-relaxed select-text space-y-1.5 h-44 overflow-y-auto text-left shadow-inner">
                          {agentTerminalLogs.map((log, lIdx) => (
                            <div
                              key={lIdx}
                              className={`flex items-start gap-1.5 whitespace-pre-wrap ${
                                log.includes("Error") || log.includes("fail")
                                  ? "text-red-400"
                                  : log.includes("complete") || log.includes("Success") || log.includes("Applied")
                                  ? "text-emerald-400 font-bold"
                                  : log.includes("Refactoring") || log.includes("optimizing")
                                  ? "text-brand-accent"
                                  : "text-slate-350"
                              }`}
                            >
                              <span className="text-neutral-600 select-none">&gt;&gt;</span>
                              <span>{log}</span>
                            </div>
                          ))}
                          {isAgentSpinning && (
                            <div className="flex items-center justify-start gap-1.5 text-[10px] text-brand-accent pl-4">
                              <span className="animate-ping bg-brand-accent w-1.5 h-1.5 rounded-full" />
                              <span className="italic">Agent running local SRE static assessment checkov tests...</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-brand-text-dim/80 pt-2 border-t border-brand-border/40 mt-3 flex items-center justify-between">
                        <span>Workspace: <strong className="text-brand-text font-mono">./infra/{output.iacFiles?.[selectedIacIndex]?.filename}</strong></span>
                        <span>State: <strong className="text-brand-text uppercase font-mono">{isAgentSpinning ? "In Progress" : "Synced"}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Deployment Credentials Panel */}
                  <div className="mt-5 pt-4 border-t border-brand-border bg-black/40 -mx-5 -mb-5 p-5 rounded-b-xl">
                    <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2 text-left">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-brand-accent shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-brand-text">Active Pipeline & Deployment Key Vault</h4>
                          <p className="text-[10px] text-brand-text-dim">Workspace environment secrets mapped securely to active SRE compilers.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                        <Shield className="w-3 h-3 text-emerald-400" /> SECURE STATE: FULLY ALIGNED
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      {/* API secret variable container */}
                      <div className="bg-brand-surface-alt border border-brand-border/80 p-3.5 rounded-lg text-xs hover:border-brand-accent/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[9px] font-bold text-brand-text-dim uppercase tracking-wider">🔑 SRE ASSISTANT ACCESS TOKEN</span>
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-500/20">VERIFIED</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="password"
                            value={agentApiKey}
                            onChange={(e) => setAgentApiKey(e.target.value)}
                            className="bg-brand-bg relative flex-1 text-[11px] font-mono border border-brand-border p-2 rounded text-brand-text/90 focus:outline-none focus:border-brand-accent tracking-wider"
                          />
                          <button
                            onClick={handleCopyApiKey}
                            className="p-2 cursor-pointer bg-neutral-800 hover:bg-neutral-700 hover:text-white border border-brand-border rounded text-brand-text-dim text-xs flex items-center justify-center min-w-[70px] transition-colors"
                            title="Copy API secret"
                          >
                            {apiKeyCopied ? (
                              <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Copied
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                        <p className="text-[9px] text-brand-text-dim mt-1.5 leading-snug font-sans">
                          Instructs the automated SRE subprocess thread pool to execute under HIPAA and SOC2 compliance verified authorizations.
                        </p>
                      </div>

                      {/* SSH / RSA Deploy public Certificate container */}
                      <div className="bg-brand-surface-alt border border-brand-border/80 p-3.5 rounded-lg text-xs hover:border-brand-accent/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[9px] font-bold text-brand-text-dim uppercase tracking-wider">🔒 REPOSITORY DEPLOY RSA SIGNATURE</span>
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-500/20">ACTIVE</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={sshDeployKey}
                            className="bg-brand-bg relative flex-1 text-[10px] font-mono border border-brand-border p-2 rounded text-brand-text/60 focus:outline-none focus:border-brand-accent select-all truncate"
                          />
                          <button
                            onClick={handleCopySshKey}
                            className="p-2 cursor-pointer bg-neutral-800 hover:bg-neutral-700 hover:text-white border border-brand-border rounded text-brand-text-dim text-xs flex items-center justify-center min-w-[70px] transition-colors"
                            title="Copy RSA Deploy Key"
                          >
                            {sshKeyCopied ? (
                              <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Copied
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                        <p className="text-[9px] text-brand-text-dim mt-1.5 leading-snug font-sans">
                          Standard AWS pipeline validation key protecting structural updates securely against unauthorized remote access.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

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
