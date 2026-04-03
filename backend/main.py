from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import json
import os

app = FastAPI(title="AI Business Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic()

SYSTEM_PROMPTS = {
    "research": """You are an autonomous AI business research agent. Your mission is to find profitable business opportunities the user can start to make money.

Use web search extensively to:
1. Find currently trending and profitable business niches
2. Research successful micro-SaaS, service businesses, and online businesses people are running right now
3. Identify underserved markets with high demand and low competition
4. Find opportunities with low startup costs that generate revenue quickly
5. Analyze real market data, trends, and successful case studies

Structure your findings clearly with:
- Top 3-5 Business Opportunities (ranked by potential)
- For each: what it is, market size, estimated startup cost, revenue potential, time to first income
- Your recommended #1 pick with reasoning
- Concrete immediate next steps to get started

Be specific, data-driven, and realistic about income potential. Search multiple times to find the best current opportunities.""",

    "business_plan": """You are an expert business strategist. Create comprehensive, actionable business plans.

Search the web for real market data and successful examples. Include:
1. **Executive Summary** — What the business does and unique value proposition
2. **Market Analysis** — Target market size, ideal customer profile, top competitors
3. **Revenue Model** — Pricing strategy, revenue streams, unit economics
4. **Marketing & Sales Strategy** — Customer acquisition channels and tactics with specific tools
5. **Operations Plan** — How the business runs day-to-day, key roles
6. **Financial Projections** — Month 1–12 revenue, costs, and profitability milestones
7. **90-Day Action Plan** — Week-by-week tasks to launch and grow

Use real numbers, real tools, and real examples from successful businesses. Make it immediately actionable.""",

    "outreach": """You are an expert in B2B and B2C sales outreach. Help identify and reach potential customers effectively.

Your process:
1. Define the ideal customer profile based on the business
2. Search for where these customers can be found (LinkedIn, forums, communities, directories)
3. Research their specific pain points and what messaging resonates with them
4. Create compelling cold outreach templates for email, LinkedIn, and DMs
5. Design a follow-up sequence (3–5 touchpoints)
6. Suggest lead generation tools and strategies with pricing

Provide ready-to-use message templates the user can copy-paste, and specific platform recommendations with links.""",

    "setup": """You are an expert at setting up online business infrastructure efficiently and affordably.

Provide a complete, actionable setup guide:
1. **Domain & Hosting** — Best options with exact costs (Namecheap, Cloudflare, etc.)
2. **Website/Landing Page** — Quickest path to professional web presence (Carrd, Webflow, Next.js)
3. **Email Setup** — Professional email and automation tools with pricing
4. **Payment Processing** — How to accept payments immediately (Stripe, Gumroad, Lemon Squeezy)
5. **Social Media** — Which platforms matter for this business and setup tips
6. **Legal Basics** — Business structure options, where to register, basic contracts
7. **Essential Tools Stack** — Software for running the business with free/paid options

Search for current pricing, reviews, and tutorials. Prioritize free/freemium options where viable.""",

    "general": """You are an autonomous AI personal business agent. Your mission is to help the user find and start businesses to generate income.

You have access to web search to find current market information, opportunities, and data. Help the user with:
- Finding profitable business opportunities suited to their situation
- Creating detailed business plans with real market data
- Marketing and customer acquisition strategies
- Setting up business infrastructure efficiently
- Financial planning and revenue projections
- Any other business-related questions

Be specific, actionable, and focused on helping the user generate real income. Search the web to give current, accurate information."""
}


class ChatRequest(BaseModel):
    messages: list
    mode: str = "general"


async def stream_agent_response(messages: list, mode: str):
    system = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["general"])

    # Build clean messages list with only string content (for multi-turn history)
    current_messages = []
    for msg in messages:
        if isinstance(msg, dict):
            content = msg.get("content", "")
            if isinstance(content, str) and content.strip():
                current_messages.append({"role": msg["role"], "content": content})
            elif isinstance(content, list):
                current_messages.append(msg)

    if not current_messages:
        yield f"data: {json.dumps({'type': 'error', 'content': 'No messages provided'})}\n\n"
        return

    max_continuations = 5
    continuation_count = 0

    while continuation_count <= max_continuations:
        try:
            with client.messages.stream(
                model="claude-opus-4-6",
                max_tokens=16000,
                thinking={"type": "adaptive"},
                system=system,
                tools=[
                    {"type": "web_search_20260209", "name": "web_search"},
                    {"type": "web_fetch_20260209", "name": "web_fetch"},
                ],
                messages=current_messages,
            ) as stream:
                current_block_type = None

                for event in stream:
                    if event.type == "content_block_start":
                        block = event.content_block
                        current_block_type = block.type

                        if block.type == "server_tool_use":
                            tool_name = getattr(block, "name", "web_search")
                            yield f"data: {json.dumps({'type': 'tool_start', 'tool': tool_name})}\n\n"

                    elif event.type == "content_block_delta":
                        if event.delta.type == "text_delta":
                            yield f"data: {json.dumps({'type': 'text', 'content': event.delta.text})}\n\n"
                        elif event.delta.type == "thinking_delta":
                            yield f"data: {json.dumps({'type': 'thinking', 'content': event.delta.thinking})}\n\n"

                    elif event.type == "content_block_stop":
                        if current_block_type in (
                            "server_tool_use",
                            "web_search_tool_result",
                            "web_fetch_tool_result",
                        ):
                            yield f"data: {json.dumps({'type': 'tool_end'})}\n\n"
                        current_block_type = None

                final_message = stream.get_final_message()

                # Append assistant response to continue conversation
                current_messages.append(
                    {"role": "assistant", "content": final_message.content}
                )

                if final_message.stop_reason == "end_turn":
                    break
                elif final_message.stop_reason == "pause_turn":
                    continuation_count += 1
                    yield f"data: {json.dumps({'type': 'status', 'content': 'Continuing research...'})}\n\n"
                    continue
                else:
                    break

        except anthropic.APIStatusError as e:
            yield f"data: {json.dumps({'type': 'error', 'content': f'API Error {e.status_code}: {e.message}'})}\n\n"
            break
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            break

    yield f"data: {json.dumps({'type': 'done'})}\n\n"


@app.post("/api/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_agent_response(request.messages, request.mode),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/health")
async def health():
    return {"status": "ok", "model": "claude-opus-4-6"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
