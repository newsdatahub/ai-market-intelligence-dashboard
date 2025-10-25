# AI Market Intelligence Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Express](https://img.shields.io/badge/Express-4-000000)
[![Powered by NewsDataHub](https://img.shields.io/badge/Powered%20by-NewsDataHub-111111)](https://newsdatahub.com)

A full-stack tutorial and open-source demo that combines **real-time news aggregation** via the [NewsDataHub API](https://newsdatahub.com) with **AI-powered summarization** via [OpenAI](https://platform.openai.com/).
The project shows how to build a market-intelligence dashboard with TypeScript, React, Express, and GPT-4-powered insights.

> ⚠️ This tutorial **requires** both a NewsDataHub API key and an OpenAI API key for full functionality.
> A built-in **Demo Mode** is also available — no keys required (see below).

---

## Table of Contents

* [Overview](#overview)
* [Demo](#demo)
* [Features](#features)
* [How It Works](#how-it-works)
* [Architecture](#architecture)
* [Prerequisites](#prerequisites)
* [Quick Start](#quick-start)
* [Example Reports](#example-reports)
* [FAQ](#faq)
* [Contributing](#contributing)
* [License](#license)

---

## Overview

The **AI Market Intelligence Dashboard** tracks and analyzes news coverage across topics, geographies, and time periods.
It combines structured news data from **NewsDataHub** with **AI summarization** to produce professional-grade intelligence reports.

**Use cases**

* Track emerging industry trends
* Generate executive summaries and contextual insights
* Analyze geographic coverage patterns
* Export PDF reports for stakeholders

---

## Demo

You can try the dashboard instantly — **no API keys required** — using the **demo topic mode**.

### How to Use Demo Mode

1. Start the application with Docker (`docker compose up`).
2. Enter a topic ending with `-demo` in the search bar:

   ```
   "artificial intelligence"-demo
   ```

3. The app will instantly display:

   * Topic Analysis dashboard with charts and metrics
   * AI-Powered News Brief (main report)
   * Timeline Insights (auto-triggered for top spike date)
   * Regional Insights (auto-triggered for top country)

> 💡 **Note:** If you enter an unsupported demo topic, you'll see a 10-second toast notification suggesting valid alternatives. If you enter a regular topic without API keys configured, you'll see which environment variables need to be set.

**Currently supported demo topics:**

* `"artificial intelligence"-demo`

All demo responses are pre-cached JSON files and work without API access or network requests.

### Demo Implementation Details

**How It Works:**

* `isDemoMode(topic)` checks if topic ends with `-demo` suffix
* Demo data stored in `backend/src/demo-data/<topic>/`:
  * `topic-analysis.json` - Dashboard metrics and charts data
  * `context-analysis.json` - Main AI report
  * `context-geo.json` - Regional insights report
  * `context-spike.json` - Timeline insights report
  * `search-topic.json` - Articles for timeline
  * `country-coverage.json` - Articles for geographic analysis

**Backend Services:**

* `demoDataService.ts` - Core demo detection and data loading
* `topicAnalysisService.ts` - Returns demo data immediately for analysis
* `routes/news.ts` - Returns demo articles for search/country endpoints
* `routes/intelligence.ts` - Returns demo reports for AI insights

**Frontend Behavior:**

* Auto-triggers all three reports when demo topic is detected:
  1. Main AI-Powered News Brief
  2. Timeline Insights (for highest spike date)
  3. Regional Insights (for top country)
* 10-second toast notifications for unsupported topics or missing API keys

**Adding New Demo Topics:**

1. Create directory: `backend/src/demo-data/<new-topic>/`
2. Add JSON files following the structure above
3. Update `getSupportedDemoTopics()` in `demoDataService.ts`:
   ```typescript
   export function getSupportedDemoTopics(): string[] {
     return ['artificial intelligence', 'new-topic'];
   }
   ```
4. Update demo data loading functions to handle the new topic

---

## Features

### Interactive Dashboard

* **Topic Analysis** — Query any topic or company name
* **Interactive Visualizations** — Sentiment charts, coverage timeline, geographic map
* **AI-Generated Reports** — GPT-4-based executive summaries
* **Drill-Down Insights** — Filter by date or country for deeper analysis
* **PDF Export** — Professionally formatted downloadable reports

> 🎥 *Add short GIFs or screenshots here once available.*

### Data Aggregation

* Real-time news fetching from NewsDataHub API
* Complex keyword queries with boolean operators
* Date-range filters (7, 14, 30 days)
* Language filtering (English in this tutorial)
* Smart caching to conserve API calls

### Analysis & Visualization

* **Sentiment Analysis** — Keyword-based scoring (positive/neutral/negative)
* **Coverage Timeline** — Interactive daily trends with spike detection
* **Geographic Map** — Article counts by source country
* **Top Sources** — Ranking of most active publishers
* **Keyword Extraction** — Frequently mentioned terms
* **Entity Recognition** — OpenAI-powered extraction of people, organizations, locations

### OpenAI Integration

* GPT-4o-mini generates concise intelligence briefs
* Performs entity extraction and contextual explanations
* Creates timeline- and region-specific reports
* Fully integrated into the backend pipeline

### Reporting

* PDF report generation (html2pdf.js)
* Embedded charts and summaries
* Professional formatting for executive distribution
* Automatic disclaimer inclusion

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Interface (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Topic Input  │  │ Dashboards   │  │ PDF Export   │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
└─────────┼──────────────────┼──────────────────┼──────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Express Backend API                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ News Routes  │  │ Intelligence │  │  Cache Layer  │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
└─────────┼──────────────────┼──────────────────┼──────────────────────┘
          │                  │
          ▼                  ▼
┌──────────────────────┐      ┌──────────────────────┐
│ NewsDataHub API      │      │ OpenAI API           │
│ News aggregation     │      │ GPT-4o-mini analysis │
└──────────────────────┘      └──────────────────────┘
```

**Processing flow**

1. User enters a topic (e.g., "quantum computing") and selects date range.
2. Backend checks for demo mode (`-demo` suffix); if found, returns cached data.
3. For live queries, backend builds optimized NewsDataHub queries.
4. Articles are fetched, paginated, deduplicated.
5. Analysis pipeline extracts sentiment, geography, keywords, sources.
6. Results cached (1h for current day, 24h for historical).
7. OpenAI generates executive summaries and contextual insights.
8. Frontend renders charts, maps, and AI reports.
9. Reports exported to PDF.

---

## Architecture

### Backend (`/backend`)

* **Stack:** Node.js, Express, TypeScript, Winston
* **Modules:**

  * `newsService.ts` – NewsDataHub integration
  * `openaiService.ts` – GPT-4 integration
  * `topicAnalysisService.ts` – sentiment + coverage aggregation
  * `entityExtractionService.ts` – NER via OpenAI
  * `cacheService.ts` – TTL caching
  * `aiReportService.ts` – executive report generator
  * `demoDataService.ts` – demo mode detection and data loading

### Frontend (`/frontend`)

* **Stack:** React 18, TypeScript, Vite, Leaflet, Plotly.js
* **Components:**

  * `AnalysisDashboard.tsx` – main dashboard
  * `TopicInput.tsx` – search interface
  * `charts/` – sentiment & timeline charts
  * `GeographicMap.tsx` – geographic visualization
  * `IntelligenceReport.tsx` – AI report view
  * `ExportReportPDF.tsx` – PDF generation
  * `Toast.tsx` – error/success notifications

---

## Prerequisites

* **Docker:** Latest stable version
* **Docker Compose:** v2.0 or higher
* **API keys (both required for live data):**

  * [OpenAI API key](https://platform.openai.com/) — for report generation
  * [NewsDataHub API key](https://newsdatahub.com) — for article data (free tier ≈ 100 calls/day; see site for current quotas)

> **Note:** Demo mode works without any API keys.

---

## Quick Start

### 1 · Clone

```bash
git clone https://github.com/newsdatahubapi/ai-market-intelligence-dashboard.git
cd ai-market-intelligence-dashboard
```

### 2 · Configure Environment

#### Backend `.env`

Create `backend/.env`:

```bash
NEWSDATAHUB_API_KEY=your_newsdatahub_key
NEWSDATAHUB_BASE_URL=https://api.newsdatahub.com
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
PORT=3001
```

#### Frontend `.env`

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

> **Quick Start with Demo Mode:** Skip environment setup and use `"artificial intelligence"-demo` as your search topic to try the dashboard immediately.

### 3 · Run with Docker

```bash
docker compose up
```

* Backend → [http://localhost:3001](http://localhost:3001)
* Frontend → [http://localhost:5173](http://localhost:5173)

Then open the dashboard and start analyzing news topics.

---

## Example Reports

Sample PDFs in `/example-reports` demonstrate outputs such as:

* `_gold-mining__News-Brief_2025-09-25-to-2025-10-25.pdf`
* `_quantum-computing__Regional-Insights_GB_2025-10-18-to-2025-10-25.pdf`
* `_semiconductors__Timeline-Insights_2025-10-16.pdf`

---

## FAQ

### **Demo Mode**

**Q: How do I use demo mode?**
Enter any supported topic with `-demo` suffix (e.g., `"artificial intelligence"-demo`).
The dashboard loads instantly using pre-cached JSON data.

**Q: What topics are available in demo mode?**
Currently supported: `"artificial intelligence"-demo`.
To add more, create a directory in `backend/src/demo-data/` and update `getSupportedDemoTopics()` in `demoDataService.ts`.

**Q: Do I need API keys for demo mode?**
No. Demo mode works completely offline — no keys, no API requests.

**Q: Does the demo behave the same as live mode?**
Yes. All charts, reports, and exports behave identically, using stored data instead of real API responses.

**Q: What happens if I enter a non-existent demo topic?**
You'll see a 10-second toast message: `"This demo topic not supported. Try: "artificial intelligence"-demo"`

---

### **API Setup & Usage**

**Q: What API keys are required for live data?**
Both:

* `NEWSDATAHUB_API_KEY` – fetches news articles and metadata.
* `OPENAI_API_KEY` – generates summaries and insights.

**Q: What's the free tier for NewsDataHub?**
≈ 100 calls/day. Visit [newsdatahub.com](https://newsdatahub.com) for the latest quotas and pricing.

**Q: How much does OpenAI cost?**
Each report typically costs ~ $0.05 – $0.15 using `gpt-4o-mini`.

**Q: What happens if I try to use a real topic without API keys?**
You'll see a 10-second toast showing which environment variables are missing:
`"Missing API configuration. Please set the following environment variables: NEWSDATAHUB_API_KEY, OPENAI_API_KEY"`

---

### **Development & Troubleshooting**

**Q: I'm getting "missing API key" errors.**

* Check `.env` in `/backend` for both `NEWSDATAHUB_API_KEY` and `OPENAI_API_KEY`.
* Ensure `VITE_API_BASE_URL` in frontend points to the correct backend port.
* For quick testing, switch to demo mode.

**Q: My topic returns no articles.**

* Broaden the query (remove quotes or use fewer words).
* Extend the date range to 14–30 days.
* Confirm topic spelling.

**Q: Why is sentiment accuracy not perfect?**
This tutorial uses a keyword-based heuristic (~70–80% accuracy).
For production, replace with an ML model or specialized NLP API.

**Q: How can I change the model or prompt?**
Edit `backend/src/utils/promptUtils.ts`.
Modify `createIntelligenceReportMessages()` for tone/length, or `createContextExplanationMessages()` for drill-downs.

**Q: Can I add more visualization types?**
Yes — extend components in `frontend/src/components/charts/`.

**Q: How do I customize PDF styling?**
Modify `frontend/src/components/ExportReportPDF.tsx` or adjust the CSS used by `html2pdf.js`.

**Q: How do I deploy this?**
This is a tutorial. For production:

* Add auth & DB, replace cache with Redis, enable HTTPS, monitoring, and rate limits.

---

### **Common Error Messages**

**Error:** `"This demo topic not supported. Try: "artificial intelligence"-demo"`
**Cause:** You entered a demo topic that doesn't exist.
**Solution:** Use one of the supported demo topics listed above, or add your own demo data.

**Error:** `"Missing API configuration. Please set the following environment variables: NEWSDATAHUB_API_KEY, OPENAI_API_KEY"`
**Cause:** You tried to search a non-demo topic without setting up API keys.
**Solution:** Either:
1. Set up your API keys in `backend/.env` (see [Quick Start](#quick-start))
2. Use demo mode by adding `-demo` to your topic

---

### **Support & Contact**

**Q: Where can I report bugs or ask questions?**

* GitHub → [Issues](https://github.com/newsdatahubapi/ai-market-intelligence-dashboard/issues) or Discussions
* Email → [support@newsdatahub.com](mailto:support@newsdatahub.com)
* [NewsDataHub Docs](https://docs.newsdatahub.com)
* [OpenAI Docs](https://platform.openai.com/docs)

**Q: Why only English?**
This tutorial filters English articles to keep sentiment and NER consistent.
NewsDataHub itself supports 80+ languages.

---

## Contributing

Pull requests welcome!

1. Fork → `git checkout -b feature/my-feature`
2. Commit → `git commit -m "Add feature: X"`
3. Push → `git push origin feature/my-feature`
4. Open PR with details

---

## Usage & Disclaimer

This project is for **educational and demonstration purposes only**.
AI-generated summaries may contain inaccuracies and are **not professional or financial advice**.
Each exported report includes this disclaimer automatically.

---

## License

MIT License – see [LICENSE](LICENSE)

---

**Built with:**
[NewsDataHub API](https://newsdatahub.com) · [OpenAI GPT-4o-mini](https://platform.openai.com/) · [React](https://react.dev) · [Express](https://expressjs.com) · [TypeScript](https://typescriptlang.org) · [Leaflet](https://leafletjs.com) · [Plotly.js](https://plotly.com/javascript/)

**Maintained by:** NewsDataHub Team

