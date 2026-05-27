export interface QuestionnaireInputs {
  orgName: string;
  industry: string;
  teamSize: string;
  compliance: string; // comma separated or single
  iacPreference: "Terraform" | "AWS CDK" | "CloudFormation";
  workloadType: string;
  traffic: string;
  budget: string;
  multiRegion: boolean;
  cicdPreference: "GitHub Actions" | "GitLab CI" | "AWS CodePipeline";
  database: string;
  needsK8s: boolean;
  needsAI: boolean;
  hasAccount: boolean;
}

export interface Decision {
  decision: string;
  reason: string;
  costImpact: string;
}

export interface Subnet {
  cidr: string;
  name: string;
  purpose: string;
  zone: string;
}

export interface IaCFile {
  filename: string;
  language: string;
  code: string;
  explanation: string;
}

export interface CostItem {
  service: string;
  monthlyCost: number;
  explanation: string;
}

export interface ChecklistItem {
  step: string;
  category: string;
  validated: boolean;
  command: string;
}

export interface TroubleshootingItem {
  issue: string;
  diagnostic: string;
  reremediate?: string; // fallback
  remediation: string;
}

export interface ScoreBoard {
  operational: number;
  security: number;
  reliability: number;
  performance: number;
  cost: number;
}

export interface LandingZoneOutput {
  executiveSummary: string;
  keyArchitecturalDecisions: Decision[];
  subnetsDesign: Subnet[];
  networkExplanation: string;
  iacFiles: IaCFile[];
  costEstimate: CostItem[];
  validationChecklist: ChecklistItem[];
  troubleshootingGuide: TroubleshootingItem[];
  scores: ScoreBoard;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
