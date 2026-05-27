import { LandingZoneOutput, QuestionnaireInputs } from "./types";

export const DEFAULT_INPUTS: QuestionnaireInputs = {
  orgName: "Acme Enterprise",
  industry: "Financial Services & SaaS",
  teamSize: "45 Engineers",
  compliance: "SOC2, HIPAA, PCI-DSS",
  iacPreference: "Terraform",
  workloadType: "SaaS Platform & REST APIs",
  traffic: "High (50M+ requests / month)",
  budget: "$5,000 - $15,000 / month",
  multiRegion: true,
  cicdPreference: "GitHub Actions",
  database: "Aurora PostgreSQL Serverless v2",
  needsK8s: false,
  needsAI: true,
  hasAccount: true,
};

export const DEFAULT_OUTPUT: LandingZoneOutput = {
  executiveSummary: `### **Enterprise AWS Landing Zone Blueprint**

This blueprint defines a multi-account AWS environment tailored for **Acme Enterprise**, aligned to the **AWS Well-Architected Framework** and **AWS Control Tower** standards. It satisfies compliance requirements for **SOC2, HIPAA, and PCI-DSS** by implementing strict physical isolation of environments, automated guardrails, and centralized auditing.

#### **Key Architectural Pillars:**
- **Centralized Security Governance:** Automated SCP policies, centralized CloudTrail logs, and strict MFA enforcement.
- **Micro-Segmented Multi-AZ Networking:** Fully private subnets with Transit Gateway connectivity and inspection VPC.
- **Zero-Trust Client Access:** Secure AWS client VPN and strictly guarded private database endpoints.
- **FinOps Optimization:** Automatic scaling rules, regional replica lifecycle rules, and intelligent database resizing.`,
  
  keyArchitecturalDecisions: [
    {
      decision: "AWS Organizations with multi-account organizational units (OU)",
      reason: "Isolates core services, active workloads, and audit logs into separate accounts to limit the blast radius.",
      costImpact: "Negligible base overhead, massive security ROI.",
    },
    {
      decision: "Dual-Region Active-Passive Failover with Aurora Global Databases",
      reason: "Provides robust compliance DR (RPO under 1 minute, RTO under 15 minutes) for financial workflows.",
      costImpact: "+$850/mo regional replica & cross-region data transfer fee.",
    },
    {
      decision: "Amazon ECS (Fargate) for scalable containers over Kubernetes",
      reason: "Minimizes compliance auditing effort and reduces raw Operational Overhead compared to EKS.",
      costImpact: "-$600/mo savings on control-plane fees & cluster management Node overhead.",
    },
    {
      decision: "S3 Object Lock & Glacier Vault with Write Once Read Many (WORM)",
      reason: "Guarantees SEC 17a-4 compliance and audit log immutability against active administrative tampering.",
      costImpact: "+$75/mo log storage fee.",
    },
  ],

  subnetsDesign: [
    { cidr: "10.100.1.0/24", name: "Public Ingress Subnet (A)", purpose: "ALB & WAF Endpoint (Egress-only nat gateways)", zone: "us-east-1a" },
    { cidr: "10.100.2.0/24", name: "Public Ingress Subnet (B)", purpose: "ALB & WAF Endpoint (Egress-only nat gateways)", zone: "us-east-1b" },
    { cidr: "10.100.10.0/22", name: "Private ECS Workload Subnet (A)", purpose: "Fargate container compute space", zone: "us-east-1a" },
    { cidr: "10.100.20.0/22", name: "Private ECS Workload Subnet (B)", purpose: "Fargate container compute space", zone: "us-east-1b" },
    { cidr: "10.100.100.0/24", name: "Isolated Database Subnet (A)", purpose: "Primary Aurora PostgreSQL instance", zone: "us-east-1a" },
    { cidr: "10.100.101.0/24", name: "Isolated Database Subnet (B)", purpose: "Secondary Aurora standby node", zone: "us-east-1b" },
  ],

  networkExplanation: `### **Custom Micro-Segmented Network Design**

This network is built inside a **Hub-and-Spoke** topology centered on an **AWS Transit Gateway (TGW)**. 

1. **Isolation Strategy:** All workloads live inside private subnets and communicate with external services solely through an AWS NAT Gateway or secure **VPC Endpoints** (Interface/Gateway) for services like S3, KMS, and Systems Manager.
2. **Access Security:** Customer connections are terminated as high-capacity TLS on the Application Load Balancer (ALB) backed by custom CloudFront WAF rules. No public IPs are assigned to task compute nodes.
3. **Database Guarding:** DB instances occupy dedicated isolated subnets lacking routing records to the public internet or external VPN blocks directly.`,

  iacFiles: [
    {
      filename: "providers.tf",
      language: "hcl",
      explanation: "Configures the modern AWS provider and implements standard global tags dynamically attached to every asset.",
      code: `terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
  backend "s3" {
    bucket         = "acme-enterprise-tf-state-prod"
    key            = "landing-zone/core-networking/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "acme-enterprise-tf-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Environment = "Production"
      Owner       = "SRE-CloudOps"
      Compliance  = "SOC2-HIPAA-PCI"
      Provisioner = "Terraform"
    }
  }
}`,
    },
    {
      filename: "main.tf",
      language: "hcl",
      explanation: "Core networking block implementing the secure Multi-AZ VPC container, public transit gateways, and database isolation subnets.",
      code: `module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5"

  name = "acme-prod-vpc"
  cidr = "10.100.0.0/16"

  azs              = ["us-east-1a", "us-east-1b"]
  public_subnets   = ["10.100.1.0/24", "10.100.2.0/24"]
  private_subnets  = ["10.100.10.0/22", "10.100.20.0/22"]
  database_subnets = ["10.100.100.0/24", "10.100.101.0/24"]

  create_database_subnet_group           = true
  create_database_subnet_route_table     = true
  enable_dns_hostnames                   = true
  enable_dns_support                     = true

  # Single NAT Gateway per AZ to balance high availability and cost optimization
  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true

  # Enable Flow Logs directly integrated with CloudWatch KMS Log groups
  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role  = true
  flow_log_max_aggregation_interval    = 60
  
  vpc_tags = {
    Classification = "Confidential"
  }
}`,
    },
    {
      filename: "active-guardrails.tf",
      language: "hcl",
      explanation: "Security compliance configurations enforcing AWS Security Hub, custom KMS CMKs, and strict S3 object lock features.",
      code: `# Enforce S3 Public Access Block globally
resource "aws_s3_account_public_access_block" "global" {
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# KMS Key for Audit Log Encryption
resource "aws_kms_key" "audit_log_key" {
  description             = "KMS Key for central security log bucket encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow CloudTrail to write cipher data"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = ["kms:Encrypt", "kms:Decrypt", "kms:ReEncrypt*", "kms:GenerateDataKey*", "kms:DescribeKey"]
        Resource = "*"
      }
    ]
  })
}

# Immutable Audit logging Bucket with Object Lock enabled for HIPAA compliance
resource "aws_s3_bucket" "audit_bucket" {
  bucket        = "acme-enterprise-secure-audit-logs"
  force_destroy = false

  object_lock_enabled = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "audit_bucket" {
  bucket = aws_s3_bucket.audit_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.audit_log_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}`,
    },
    {
      filename: "pipeline.yml",
      language: "yaml",
      explanation: "Secure GitOps continuous deployment pipeline ensuring lint checks, plan reviews, and OIDC federated AWS deployment authentication.",
      code: `name: "IaC Security Scan & Continuous Deployment"

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

permissions:
  id-token: write # Mandatory for secure AWS token exchange using OIDC
  contents: read

jobs:
  tf-audit:
    name: "Static Code Analysis"
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install Terraform Linter
        run: |
          wget https://github.com/terraform-linters/tflint/releases/download/v0.50.1/tflint_linux_amd64.zip
          unzip tflint_linux_amd64.zip
          sudo install tflint /usr/local/bin

      - name: Initialize TFLint
        run: tflint --init

      - name: Run TFLint Validation
        run: tflint -f compact

      - name: Run Checkov Security Assessment
        uses: bridgecrewio/checkov-action@master
        with:
          framework: terraform
          output_format: cli
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
          terraform_version: "1.7.4"

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::112233445566:role/GitHubActionsIaCDeployer
          aws-region: us-east-1

      - name: Terraform Init
        run: terraform init

      - name: Terraform Plan
        id: plan
        run: terraform plan -out=tfplan -no-color

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve tfplan`,
    },
  ],

  costEstimate: [
    { service: "AWS Control Tower & AWS Organizations logs", monthlyCost: 45, explanation: "Standard management overhead for active root logging." },
    { service: "Aurora Serverless v2 PostgreSQL instances (Dual AZ)", monthlyCost: 310, explanation: "Primary cluster scaling dynamically with load between 1.0 and 4.0 ACUs + Backup storage allotment." },
    { service: "AWS Fargate Serverless Cluster Containers (ECS)", monthlyCost: 280, explanation: "Average cluster executing 4 running services dynamically scaled behind Application Load Balancer." },
    { service: "AWS NAT Gateways (Dual Zone Egress Transit)", monthlyCost: 130, explanation: "Base network processing fee for 2 active gateways + $0.045/GB standard transit data." },
    { service: "CloudFront CDN with Managed Shield Protection", monthlyCost: 85, explanation: "Regional cached endpoints and dynamic SSL terminations with global WAF rule checks." },
    { service: "Security Hub, GuardDuty, and Inspector", monthlyCost: 110, explanation: "Centralized scanning of ECS containers, IAM compliance rule compliance, and VPC network anomalies." },
  ],

  validationChecklist: [
    { step: "Initialize Multi-Account Organization Structures", category: "Control Tower Initializer", validated: true, command: "aws organizations create-organization" },
    { step: "Verify SCP compliance rule prevention active", category: "Security Audit", validated: true, command: "aws organizations list-policies --filter SERVICE_CONTROL_POLICY" },
    { step: "Format audit configurations with Terraform Lints", category: "DevSecOps", validated: false, command: "terraform fmt -check && terraform validate" },
    { step: "Generate secure encryption keys", category: "KMS Config", validated: true, command: "aws kms create-key --description \"Audit Vault Key\"" },
    { step: "Audit IAM MFA user configurations", category: "IAM Defense", validated: false, command: "aws iam get-credential-report" },
    { step: "Trigger active intrusion testing simulations", category: "Network Penetration", validated: false, command: "nmap -Pn -p 443,A-Z -T4 <alb-endpoint>" },
  ],

  troubleshootingGuide: [
    {
      issue: "AWS Organization SCP Block during IAM creation",
      diagnostic: "Received 'AccessDenied' when issuing non-approved AWS resource builds under a child account.",
      remediation: "Verify child policies allow specific actions. Check if control tower 'deny-all-unencrypted-transits' policy blocks active resources in targeted regions.",
    },
    {
      issue: "RDS Standby Cluster Replication Latency Spikes",
      diagnostic: "Aurora Global Secondary cluster database exhibits lagging update logs compared to the primary primary instance.",
      remediation: "Confirm Transit Gateway configuration supports optimal route tables. Adjust replication performance settings inside database parameters groups.",
    },
    {
      issue: "ECS Task startup failures or Route timeouts",
      diagnostic: "Fargate container crashes on boot with exit status codes. Health checklist times out on ALB target groups.",
      remediation: "Check ECS security group setup. Make sure the container has access to endpoint egress for pulling images from the ECR registry via a NAT gateway or PrivateLink.",
    },
  ],

  scores: {
    operational: 94,
    security: 98,
    reliability: 92,
    performance: 88,
    cost: 85,
  },
};
