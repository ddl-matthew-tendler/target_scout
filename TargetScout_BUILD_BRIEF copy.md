# TargetScout — Build Brief for Claude Code

**Goal:** A vibe-coded Domino app that generates a ranked list of novel target hypotheses for a chosen disease, with an evidence graph, tractability scores, and a one-paragraph narrative per target — in under 10 seconds from one prompt.

**Context:** This will be demoed live for 30 seconds at a Domino company event to a room of life-sciences professionals. The point is to show that Domino is a platform for productized AI apps and agents — not just a notebook launcher. The audience has seen a thousand pitches; the only thing that will land is (a) a visible payoff in under 30 seconds and (b) a clear story about which Domino Platform Primitives are doing the work behind the scenes.

---

## What the app does (user-visible)

A single-screen web app. One input box: "Disease or indication" (e.g., "IPF", "ulcerative colitis", "ALS"). One button: **Find targets**.

On submit, within ~10 seconds the app shows:

1. **Ranked list of 10 target hypotheses** (gene symbols), each with:
   - Tractability score (0-10)
   - Novelty score (0-10)
   - Disease-association strength (0-10)
   - A one-sentence LLM-written rationale with inline citations
2. **Evidence graph** on the right side — a force-directed network showing the disease node in the center, the 10 targets around it, and edges labeled by evidence source (genetic, literature, pathway, clinical).
3. **Detail pane** that appears when you click a target: full LLM narrative (3-4 sentences), source list (linked), and "similar programs" — actual public competitor trials referencing the target from ClinicalTrials.gov.
4. **Footer badge:** "Built on Domino Platform Primitives: Data Sources · Model Endpoint · Agent Orchestration · App Hosting · Scheduled Refresh". Make this subtle but visible — it's the punchline.

---

## Data sources (all 100% public — zero data-provenance risk)

1. **Open Targets Platform GraphQL API** — https://api.platform.opentargets.org/api/v4/graphql
   - Free, no auth. Gives you target-disease associations with overall and breakdown scores (genetic, drugs, literature, pathways, known drugs, RNA expression, animal models).
   - Key query: `associatedTargets(efoId: "EFO_XXXX", size: 25)` returns targets ranked by overall association score, with a score breakdown per datatype.
   - Tractability data is also available: `target(ensemblId).tractability` returns modality-by-modality tractability buckets (small molecule, antibody, PROTAC, etc.).
2. **EFO disease ontology lookup** — `search(queryString: "ulcerative colitis", entityNames: ["disease"])` maps a free-text disease name to an EFO ID.
3. **ClinicalTrials.gov v2 API** — https://clinicaltrials.gov/api/v2/studies?query.cond={disease}&query.term={gene_symbol}
   - Free, no auth. Used to pull the top ~5 competitor trials mentioning each target for the "similar programs" panel.
4. **LLM** — whatever Domino has deployed as a Model Endpoint. Use it for: rationale generation per target, novelty assessment, and a one-line narrative summary at the top of the page. Don't have it do ranking math — that comes from Open Targets scores.

**Novelty score heuristic** (compute client-side, not from Open Targets): `10 - (number_of_approved_drugs_targeting_gene + number_of_phase_3_trials_targeting_gene / 3)`, clamped to 0-10. Open Targets returns `knownDrugs` which has what you need. The point is to reward targets that haven't been drugged yet.

---

## Architecture (keep it tiny)

```
┌─────────────────────────────────────────────┐
│  Browser (single-page app, React or plain) │
└────────────────┬────────────────────────────┘
                 │ POST /api/score
                 ▼
┌─────────────────────────────────────────────┐
│  FastAPI backend (one file)                 │
│  - /api/score      ← orchestrator endpoint  │
│  - /api/similar    ← ClinicalTrials.gov     │
│  - /api/narrative  ← LLM call per target    │
└────┬────────────┬─────────────┬─────────────┘
     │            │             │
     ▼            ▼             ▼
 Open Targets   CT.gov       LLM endpoint
  GraphQL       REST v2      (Domino model)
```

**Hosted on Domino as a Domino App** (this is Primitive #1). One container, one entry point, `/` serves the SPA, `/api/*` serves JSON.

**One cache layer** (in-memory `dict` or `diskcache`) so repeated disease lookups are instant in the demo.

---

## Domino Platform Primitives to showcase (this is the pitch)

The footer and the "tell" during the demo should name these explicitly. Pick whichever maps best to your current platform terminology — here are the ones the app actually exercises:

1. **Data Sources** — Open Targets, ClinicalTrials.gov registered as governed external data sources with cached refresh. Shows that Domino governs external data access for AI apps, not just internal datasets.
2. **Model Endpoint (or Model API)** — the LLM is called as a Domino-hosted model endpoint with RBAC. Shows that Domino hosts and governs models for consumption by apps, not just for notebook experimentation.
3. **Agent Orchestration** — the `/api/score` endpoint runs an agent that: (1) resolves the disease to EFO, (2) fetches associations, (3) parallel-fans-out to fetch tractability per target, (4) parallel-fans-out to generate narratives. Shows multi-step agent workflows — not a single-shot prompt.
4. **Domino Apps** — the whole thing is packaged and published as a Domino App with one-click sharing, RBAC, and a stable URL.
5. **Scheduled Jobs** — a nightly job warms the cache for the top 20 indications in the company's portfolio so the live demo is instant. Shows productionization, not a just-in-time hack.

**Talk track for the 30-second demo:**
> "I type 'IPF' and hit go. In ten seconds I get ten novel target hypotheses, ranked, each with a tractability score, a novelty score, an evidence graph, and the competitor trials already chasing them. Every number here is traceable to a public source. And the whole thing is five Domino primitives composed together — data sources, a governed model endpoint, agent orchestration, an app, and a nightly refresh job. One engineer. One week. All yours."

---

## File layout

```
targetscout/
├── app/
│   ├── main.py                 ← FastAPI app, orchestrator
│   ├── opentargets.py          ← GraphQL client + score fetchers
│   ├── clinicaltrials.py       ← CT.gov v2 client
│   ├── llm.py                  ← Domino model endpoint wrapper
│   ├── scoring.py              ← novelty heuristic, composite score
│   └── cache.py                ← diskcache wrapper
├── web/
│   ├── index.html              ← single page
│   ├── app.js                  ← fetch + render, force graph via d3
│   └── style.css
├── scheduled/
│   └── warm_cache.py           ← nightly job
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## Build steps

1. **Scaffold the FastAPI app** with a `/api/score?disease=` endpoint that returns mock JSON. Get the web page rendering against mock data first — this is the demo's shape.
2. **Open Targets integration:**
   - `search_disease(free_text) → efo_id` via the GraphQL `search` query.
   - `associated_targets(efo_id, size=25) → [{ensemblId, symbol, overallScore, scoreBreakdown, knownDrugs}]`.
   - `target_tractability(ensembl_id) → {modality: bucket_score}`.
3. **Scoring:**
   - Disease association = Open Targets `overallScore` × 10.
   - Tractability = max tractability bucket across modalities, normalized to 0-10.
   - Novelty = `10 - min(10, approved_drugs + phase3_trials/3)`, clamped.
   - Composite rank = weighted sum (disease×2 + tractability×1.5 + novelty×1.5).
4. **Parallel fan-out** — when you have the top 10 targets, `asyncio.gather` the tractability, narrative, and similar-trials fetches. This is the "agent" story and it also makes the app feel fast.
5. **LLM narrative** — one prompt per target:
   > "In 2-3 sentences, explain why {gene_symbol} is a compelling target for {disease}. Ground your answer in: genetic evidence score {X}, literature mentions {N}, known drugs {list}. Do not speculate. Cite Open Targets where relevant."
   Return the text + a confidence self-rating.
6. **ClinicalTrials.gov integration** — for each of the top 10 targets, fetch up to 5 trials where `query.cond={disease}` AND (`query.term={symbol}` OR target name appears in description). Extract NCT ID, sponsor, phase, status.
7. **Evidence graph** — d3-force. Disease node in center (orange per Domino brand), 10 target nodes around it. Edge thickness = overall association score. Edge color by dominant datatype (genetic, literature, drugs, pathways). Click a target → highlight its edges and open the detail pane.
8. **Caching** — `diskcache` keyed on disease EFO. TTL = 7 days. Pre-warm the cache with the company's priority indications via the scheduled job.
9. **Footer primitives badge** — static HTML. Include small Domino mark.
10. **Dockerfile + Domino App config** — standard Domino app deployment.

---

## Critical UX rules for the demo

- **Pre-warm the cache before the event.** The first query must be instant. Put 10 indications in a dropdown as suggestions so the presenter never types.
- **Streaming rendering.** Don't wait for all 10 narratives before drawing the list. Show the ranked list and graph immediately from Open Targets scores, and stream in the LLM narratives as they complete. The visible "things lighting up one by one" is part of the demo feel.
- **No loading spinner over the whole screen.** Skeleton the ranked list, animate in each row. The feeling you want is "the system is working for me right now."
- **Failure path must be quiet.** If CT.gov times out, silently omit similar-programs — don't error. If the LLM fails for a target, show Open Targets scores only for that row.
- **No real patient data anywhere.** Say this out loud at the start of the demo: "everything you're about to see is public — Open Targets, PubMed via Open Targets, ClinicalTrials.gov. No proprietary data."

---

## Stretch goals (if you have time)

- **Export to PowerPoint.** "Export this target list as a briefing pack" button → calls the `pptx` skill pattern to generate a 5-slide deck: 1 summary, 10 target cards. This doubles the wow factor and shows the doc-gen primitive.
- **Watch list.** User can save a target; a scheduled job re-scores it weekly and emails them if its rank moves. Shows the scheduled-jobs primitive in a second dimension.
- **"Explain this edge"** — click an edge in the graph, LLM writes one sentence explaining the evidence type. Reinforces the governed-model-endpoint story.
- **Branching queries.** "Show me targets novel to {disease} but validated in {related disease}" — this is the agent story in its fullest form and gets science audiences excited.

---

## What NOT to build

- No user accounts, no auth inside the app — rely on Domino App RBAC at the platform level. (Exception if the platform doesn't front-load that — if that's the case, a single shared-token gate is fine.)
- No vector database, no RAG over full papers. Open Targets already aggregates literature evidence. Don't reinvent it.
- No fine-tuning, no custom models. Use whatever LLM Domino has on tap.
- No write-back to any system. This is read-only for v1.
- No mobile layout. Desktop demo only.

---

## Demo-day checklist

- [ ] Cache is warm for at least 10 indications relevant to the attendees' companies
- [ ] Backup video recording of a successful run in case wifi fails
- [ ] Dropdown of pre-loaded diseases so the presenter never has to type
- [ ] Footer primitives badge is legible from the back of the room
- [ ] Rehearsed the 30-second narration, timed to the animation
- [ ] Primitives talk track rehearsed for when someone asks "what's really behind this"
- [ ] Q&A preparation: "where does the ranking come from?" "can you run this on your own data?" "how fast could we do this with our FDE?"
- [ ] Answer to the inevitable question: "this took one engineer one week using Domino Platform Primitives — your FDE can stand this up with you in the same timeframe."

---

## Key dependencies (requirements.txt)

```
fastapi
uvicorn[standard]
httpx            # async HTTP for Open Targets + CT.gov
diskcache        # local cache
pydantic
jinja2           # serve the HTML
# LLM client — whatever Domino's model endpoint client library is
```

Frontend: plain HTML + d3-force (CDN) + fetch. No build step. Keep it vibe-able.

---

## Open Targets example query (paste-ready)

```graphql
query TargetsForDisease($efoId: String!) {
  disease(efoId: $efoId) {
    id
    name
    associatedTargets(page: { index: 0, size: 25 }) {
      rows {
        score
        target {
          id
          approvedSymbol
          approvedName
          tractability {
            modality
            id
            value
          }
          knownDrugs {
            uniqueDrugs
          }
        }
        datatypeScores {
          id
          score
        }
      }
    }
  }
}
```

Hit https://api.platform.opentargets.org/api/v4/graphql with `{"query": "...", "variables": {"efoId": "EFO_0000384"}}`.

---

## ClinicalTrials.gov example

```
GET https://clinicaltrials.gov/api/v2/studies?query.cond=ulcerative+colitis&query.term=IL23A&pageSize=5&fields=NCTId,BriefTitle,Phase,OverallStatus,LeadSponsorName
```

Returns JSON. No auth.

---

## The one thing to get right

The hardest part isn't the data or the LLM. It's the **feel**. The demo succeeds if, 10 seconds after the presenter hits Enter, the audience sees a ranked list with numbers, a graph drawing itself, and narratives streaming in. The demo fails if they see a spinner. Engineer the whole thing around making the first 10 seconds of render time feel inevitable.
