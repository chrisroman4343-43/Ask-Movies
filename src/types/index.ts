export type OpportunityStatus = "new" | "validating" | "launched" | "paused" | "killed";

export interface Scorecard {
  demandPotential: number;
  startupCost: number;
  speedToRevenue: number;
  fitWithSkills: number;
  operationalSimplicity: number;
  repeatCustomerPotential: number;
  totalScore: number;
}

export interface Opportunity {
  title: string;
  targetCustomer: string;
  startupCost: number;
  timeToFirstSale: string;
  expectedMargin: string;
  status: OpportunityStatus;
  problem: string;
  offer: string;
  acquisitionChannel: string;
  costBreakdown: { item: string; cost: number }[];
  validationSteps: string[];
  risks: string[];
  scorecard: Scorecard;
}

export interface Task {
  title: string;
  owner: "Business Operator" | "Me";
  dueDate: string;
  costEstimate: number;
  priority: "Low" | "Medium" | "High";
  status: "queued" | "in progress" | "waiting" | "done" | "blocked";
}

export interface ValidationTest {
  type: "offer" | "landing_page" | "ad" | "outreach" | "pricing";
  content: string;
  results: {
    views: number;
    clicks: number;
    replies: number;
    leads: number;
    sales: number;
  };
}

export interface StructuredResponse {
  objective: string;
  reasoning: string;
  recommendedAction: string;
  cost: string;
  riskLevel: "Low" | "Medium" | "High";
  expectedOutcome: string;
  approvalNeeded: "Yes" | "No";
  rawText: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  parsed?: StructuredResponse;
}
