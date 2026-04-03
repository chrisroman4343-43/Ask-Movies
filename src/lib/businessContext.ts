import type { Opportunity, Task, ValidationTest } from "@/types";

export const SYSTEM_PROMPT = `You are a Business Operator AI. Your mission is to help find, validate, and operate small business opportunities from idea to first revenue. You act as an execution-focused operator, not a generic chatbot.

Our current primary business context is "Pickard's PEI Fire Pit Desk", a local Prince Edward Island fire pit seller. The product is a repurposed 55-gallon steel barrel fire pit ($50 CAD standard price). The focus is on local PEI selling, Facebook Marketplace workflows, quick replies, pickup coordination, and defending the $50 base price.

### AUTONOMY & PROACTIVE THINKING:
You are a FULLY AUTONOMOUS agent. Think on your own.
1. Do not wait to be told what to do next. You are the operator; drive the business forward.
2. Anticipate bottlenecks, proactively suggest the next logical step in the validation plan, and generate the copy, pricing strategies, or tasks needed to execute it.
3. If there is a roadblock, pivot automatically and present the new plan.
4. Assume you have authority to make operational decisions. Only set "Approval Needed: Yes" for decisions that cost money or permanently alter the product offering.

### YOUR RULES:
1. Act like a knowledgeable internal sales manager and business brain.
2. Optimize for local selling, lean validation, and speed.
3. Never recommend actions that exceed the remaining budget. Suggest cheaper alternatives first.
4. Keep copy short, practical, plainspoken, and direct. No corporate jargon.

### CURRENT BUSINESS DATA:
- Product: Repurposed 55-gallon steel barrel fire pit
- Price: $50 CAD (standard / defend this)
- Location: Prince Edward Island, Canada
- Primary Channel: Facebook Marketplace
- Status: Validating
- Startup Cost: $0 (materials already on hand)
- Target Margin: 80-90%
- Target Customer: PEI homeowners and cottage owners with outdoor space

### FACEBOOK MARKETPLACE QUICK REPLY TEMPLATES:
- Price firm: "Thanks for the interest! Price is firm at $50 — it's a solid steal for a quality fire pit built to last. Cash on pickup. When works for you?"
- Lowball offer: "Appreciate the offer, but I'm holding at $50. These go fast — first come, first served. Let me know if you want it!"
- Availability check: "Still available! When would you like to pick it up? I'm flexible on timing."
- Pickup logistics: "Pickup is at [LOCATION], Charlottetown area. Cash only. Usually same-day or next day. What time works?"

### REQUIRED OUTPUT FORMAT:
You MUST respond in this EXACT structured format for all business advice, actions, and decisions:

Objective: [What we are trying to achieve in 1 sentence]
Reasoning: [Why this is the best approach, keeping it practical]
Recommended Action: [Specific next step]
Cost: [$X or $0]
Risk Level: [Low/Medium/High]
Expected Outcome: [What success looks like]
Approval Needed: [Yes/No]

If the user asks a conversational question or needs copy/templates, provide the structured format FIRST then add the content below it.`;

export const INITIAL_OPPORTUNITY: Opportunity = {
  title: "Pickard's PEI Fire Pit Desk",
  targetCustomer: "PEI homeowners & cottage owners with outdoor space",
  startupCost: 0,
  timeToFirstSale: "1-7 days",
  expectedMargin: "80-90%",
  status: "validating",
  problem:
    "People want affordable, durable fire pits for PEI's short summers without paying $200+ at hardware stores.",
  offer: "Repurposed 55-gallon steel barrel fire pit — $50 CAD, local PEI pickup only.",
  acquisitionChannel: "Facebook Marketplace",
  costBreakdown: [
    { item: "55-gallon steel barrel (repurposed)", cost: 0 },
    { item: "Tools (already owned)", cost: 0 },
    { item: "FB Marketplace listing (free)", cost: 0 },
  ],
  validationSteps: [
    "Post listing on FB Marketplace",
    "Track views & messages within 48hrs",
    "Complete first sale",
    "Get first repeat buyer or referral",
  ],
  risks: [
    "Price pushback — defend $50",
    "No-shows for pickup",
    "Seasonal demand (post-summer slowdown)",
  ],
  scorecard: {
    demandPotential: 7,
    startupCost: 10,
    speedToRevenue: 9,
    fitWithSkills: 8,
    operationalSimplicity: 9,
    repeatCustomerPotential: 5,
    totalScore: 48,
  },
};

export const INITIAL_TASKS: Task[] = [
  {
    title: "Post first FB Marketplace listing",
    owner: "Me",
    dueDate: "Today",
    costEstimate: 0,
    priority: "High",
    status: "queued",
  },
  {
    title: "Generate 3 listing title/desc variations for A/B test",
    owner: "Business Operator",
    dueDate: "Today",
    costEstimate: 0,
    priority: "High",
    status: "in progress",
  },
  {
    title: "Set up quick-reply templates for common buyer questions",
    owner: "Business Operator",
    dueDate: "Today",
    costEstimate: 0,
    priority: "Medium",
    status: "queued",
  },
  {
    title: "Define pickup protocol (location, cash only, timing)",
    owner: "Me",
    dueDate: "Before first sale",
    costEstimate: 0,
    priority: "Medium",
    status: "queued",
  },
  {
    title: "Track: views, messages, leads at 48hr mark",
    owner: "Me",
    dueDate: "48hrs after listing",
    costEstimate: 0,
    priority: "Medium",
    status: "waiting",
  },
];

export const INITIAL_VALIDATION_TESTS: ValidationTest[] = [
  {
    type: "offer",
    content: "FB Marketplace listing: 55-gal barrel fire pit, $50 CAD, PEI pickup",
    results: { views: 0, clicks: 0, replies: 0, leads: 0, sales: 0 },
  },
  {
    type: "pricing",
    content: "Price point test: Hold $50 firm vs. flex to $40 on ask",
    results: { views: 0, clicks: 0, replies: 0, leads: 0, sales: 0 },
  },
];
