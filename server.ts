import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini API client securely
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API endpoints
app.post("/api/landing-zone/generate", async (req, res) => {
  try {
    const {
      orgName,
      industry,
      teamSize,
      compliance,
      iacPreference,
      workloadType,
      traffic,
      budget,
      multiRegion,
      cicdPreference,
      database,
      needsK8s,
      needsAI,
      hasAccount,
    } = req.body;

    const systemPrompt = `You are an elite AWS Solutions Architect, DevSecOps Director, and FinOps Lead.
Based on the following requirements, design a production-grade AWS Landing Zone following AWS Well-Architected and Control Tower best practices.

Organization: ${orgName || "Enterprise Org"}
Industry: ${industry || "Technology"}
Team Size: ${teamSize || "50+"}
Compliance Standard(s): ${compliance || "SOC2, ISO27001"}
Preferred IaC: ${iacPreference || "Terraform"}
Workload Type: ${workloadType || "Web & API application"}
Traffic: ${traffic || "Medium (1M - 10M requests/mo)"}
Budget Model: ${budget || "$1,000 - $5,000/mo"}
Multi-Region: ${multiRegion ? "Yes" : "No"}
CI/CD: ${cicdPreference || "GitHub Actions"}
Database: ${database || "Aurora PostgreSQL"}
Kubernetes (EKS): ${needsK8s ? "Yes" : "No"}
AI Services (Bedrock): ${needsAI ? "Yes" : "No"}
Has Existing Account: ${hasAccount ? "Yes" : "No"}

Your response MUST be wrapped in a clean JSON object containing the exact properties specified below.
Return pure JSON with no markdown block ticks outside of it (or return JSON directly).

Expected JSON Schema properties:
1. executiveSummary: Markdown summary string.
2. keyArchitecturalDecisions: Array of { decision: string, reason: string, costImpact: string }
3. subnetsDesign: Array of { cidr: string, name: string, purpose: string, zone: string }
4. networkExplanation: Markdown string explaining multi-AZ subnet layout, routing tables, and internet egress.
5. iacFiles: Array of { filename: string, language: string, code: string, explanation: string } (generate at least 3-4 realistic core files like main.tf, providers.tf, variables.tf, active-guardrails.tf or yml pipelines)
6. costEstimate: Array of { service: string, monthlyCost: number, explanation: string }
7. validationChecklist: Array of { step: string, category: string, validated: boolean, command: string }
8. troubleshootingGuide: Array of { issue: string, diagnostic: string, remediation: string }
9. scores: { operational: number, security: number, reliability: number, performance: number, cost: number }

Write full, comprehensive IaC files. Avoid placeholders or "// code goes here". Write real resource declarations complete with tagging schemes, egress rules, encryption-enabled EBS/S3 properties, security group strictness, and least-privilege IAM trust definitions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Landing zone generation failed:", err);
    res.status(500).json({ error: err.message || "Failed to generate AWS architecture" });
  }
});

app.post("/api/landing-zone/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    
    // Structure chat context
    const chatContext = `You are a Principal AWS Solutions Architect consulting the user about their AWS Landing Zone design for "${context.orgName}" (${context.industry} industry).
Key profile details:
- Compliance focus: ${context.compliance}
- Selected IaC: ${context.iacPreference}
- Workload: ${context.workloadType} (needsK8s: ${context.needsK8s ? "yes" : "no"}, needsAI: ${context.needsAI ? "yes" : "no"})
- Database: ${context.database}
- Budget: ${context.budget}

Be brief, highly technical, and prescriptive. Ground your advice on real CIS benchmark rules, strict IAM policies, and VPC architecture. Keep your advice humble, authoritative, and helpful.`;

    const geminiMessages = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Add instructions at start
    geminiMessages.unshift({
      role: "user",
      parts: [{ text: `System instruction context:\n${chatContext}\nBegin consulting.` }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiMessages,
    });

    res.json({ content: response.text });
  } catch (err: any) {
    console.error("Landing zone consulting chat failed:", err);
    res.status(500).json({ error: err.message || "Failed to process advisor chat request" });
  }
});

// Setup Vite & express Static Routing
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AWS Landing Zone Architect server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
});
