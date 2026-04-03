import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const FINDER_PROMPT = `You are an autonomous business scout. Research and score 5 real small business opportunities someone can start with low capital (ideally under $500) and reach first dollar within 30 days.

Operator profile:
- Prince Edward Island, Canada
- Comfortable with physical work and local/online selling
- Limited budget — prefers $0 startup
- Has hustle skills, no corporate experience needed

Use web search to validate REAL demand before scoring anything. Look for:
- Forum posts, Reddit threads, marketplace listings proving demand
- Actual income reports from real operators
- Startup cost breakdowns with real numbers
- Time to first paying customer

Score each on these dimensions (1-10, higher = better):
- demandPotential: Proven market demand right now
- startupCost: 10 = free, 1 = very expensive
- speedToRevenue: 10 = same day, 1 = months away
- fitWithSkills: Fit for a physical/hustler operator
- operationalSimplicity: Can one person run it solo
- repeatCustomerPotential: Do customers return or refer

Return ONLY valid JSON with this exact structure:
{
  "opportunities": [
    {
      "title": "string",
      "targetCustomer": "string",
      "startupCost": 0,
      "timeToFirstSale": "string",
      "expectedMargin": "string",
      "status": "new",
      "problem": "string",
      "offer": "string",
      "acquisitionChannel": "string",
      "costBreakdown": [{"item": "string", "cost": 0}],
      "validationSteps": ["string"],
      "risks": ["string"],
      "whyNow": "string",
      "firstAction": "string",
      "confidenceScore": 85,
      "scorecard": {
        "demandPotential": 8,
        "startupCost": 9,
        "speedToRevenue": 8,
        "fitWithSkills": 8,
        "operationalSimplicity": 8,
        "repeatCustomerPotential": 7,
        "totalScore": 48
      }
    }
  ]
}

No dropshipping, MLM, crypto, or passive income fantasies. Real businesses only.`;

export async function POST(request: Request) {
  const { query } = await request.json().catch(() => ({ query: null }));

  const userMsg = query
    ? `Research and find 5 business opportunities focused on: ${query}. Validate each with real data.`
    : `Find 5 of the best businesses I can start this week in Atlantic Canada (PEI) with under $500. Validate demand with web search and give me real numbers.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        send({ type: "status", message: "Scanning markets for opportunities..." });

        // Run the research with web search tool
        const response = await client.messages.create({
          model: "claude-opus-4-6",
          max_tokens: 4096,
          system: FINDER_PROMPT,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: [{ type: "web_search_20260209", name: "web_search" }] as any,
          messages: [{ role: "user", content: userMsg }],
        });

        send({ type: "status", message: "Validating and scoring each opportunity..." });

        // Pull out the final text block
        let resultText = "";
        for (const block of response.content) {
          if (block.type === "text") {
            resultText += block.text;
          }
        }

        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Agent returned no structured data");

        const parsed = JSON.parse(jsonMatch[0]);
        send({ type: "result", data: parsed });
      } catch (err) {
        send({ type: "error", message: String(err) });
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
