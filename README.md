# AI Business Agent

An autonomous AI personal agent that helps you find and start profitable businesses. Built with Claude Opus 4.6, FastAPI, and React.

## What it does

The agent searches the web in real-time using Claude's built-in tools to:

- **Business Research** — Find profitable opportunities with market data and revenue estimates
- **Business Plans** — Generate comprehensive plans with real financials and action steps
- **Customer Outreach** — Identify target customers and create ready-to-use outreach templates
- **Online Setup** — Guide you through domain, hosting, payments, and legal setup

## Stack

- **Backend**: Python + FastAPI + Anthropic SDK (Claude Opus 4.6 with adaptive thinking + web search)
- **Frontend**: React 18 + Vite with streaming SSE support

## Setup

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_key_here
python main.py
```

The API runs on `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## How it works

1. You pick an agent mode (Research, Business Plan, Outreach, Setup)
2. Ask a question — the agent uses Claude Opus 4.6 with adaptive thinking
3. Claude automatically searches the web for current market data
4. Responses stream in real-time with search status indicators
5. Click "Show reasoning" on any response to see Claude's thinking process
