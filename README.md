# Jhanjhat

> **Read the deal, count the hours, rehearse the call, before you say yes.**

Jhanjhat is a local-first tool for freelancers. Paste a contract, a brief or a client chat and it finds the risky clauses, the hidden work and the real hours, tells you whether to **take it, renegotiate or walk away**, and drafts the reply. Then it lets you **rehearse the hard conversation out loud** with a pretend client built from your own deal, and scores what you gave away for free.

Reasoning runs on your machine with **Gemma through Ollama**. Embeddings use **OpenRouter**, voice practice uses an **ElevenLabs agent**, and identifiers are stripped before anything leaves.

Built for **Hacktoberfest Hack Day Chandigarh 2026**.

[Demo video](ADD_VIDEO_LINK) · [Blog post](ADD_BLOG_LINK)

<!-- BEFORE PUSHING: 1) edit the Status table to match what actually runs, 2) add the video and blog links, 3) replace <gemma-model-tag> with the tag you use (check `ollama list`). -->

---

## Contents

1. [The story](#the-story)
2. [Vision, mission and scope](#vision-mission-and-scope)
3. [Features and status](#features-and-status)
4. [How it works](#how-it-works)
5. [The trust model](#the-trust-model)
6. [Privacy: what leaves your machine](#privacy-what-leaves-your-machine)
7. [Tech stack](#tech-stack)
8. [Data model](#data-model)
9. [Repository layout](#repository-layout)
10. [Getting started](#getting-started)
11. [Configuring the ElevenLabs agent](#configuring-the-elevenlabs-agent)
12. [Scripts](#scripts)
13. [Demo walkthrough](#demo-walkthrough)
14. [Testing](#testing)
15. [Troubleshooting](#troubleshooting)
16. [Limitations and responsible use](#limitations-and-responsible-use)
17. [Roadmap](#roadmap)
18. [Prior art and acknowledgements](#prior-art-and-acknowledgements)
19. [License](#license)

---

## The story

It is 8:15 on a Monday evening and a boutique owner from Jaipur is on the phone.

She wants a landing page for her Diwali collection. One page, a gallery, a WhatsApp button. Budget: ₹8,000. You have built this a dozen times.

"Ho jayega, ma'am."

There are two seconds of silence. Then she says: *"Ek order form bhi chahiye, aur Instagram feed bhi dikhana hai. Payment launch ke baad kar denge, theek hai?"*

You say "haan, dekhte hain." She hears yes.

Three weeks later you add up the hours. The page that should have taken 10 hours took 41. The order form turned into an order system, the feed became an integration, and there were four rounds of "logo thoda bada karo". That is about **₹195 an hour**, and the payment is still "next week".

Nothing in this story is a coding failure. The money was lost in two seconds of silence on a phone call, and in terms nobody read closely.

*Jhanjhat* is the Hindi word for this kind of trouble: the hassle that arrives uninvited, politely. This project is a tool for the moment **before** you say yes.

## Vision, mission and scope

**Vision.** A world where no freelancer says yes to work they have not read, priced and practised defending.

**Mission.** Give every freelancer, including those with no lawyer, manager or negotiation training, a private tool that reads the deal before they commit, counts the real hours, and lets them rehearse the hard conversation out loud.

**Who it is for.** Solo freelancers and small studios who quote fixed-price work, starting with English and Hinglish.

**In scope (v1)**

- Deal analysis with verified quotes, an hours range, hidden costs and a decision with a draft reply
- A voice Practice Room with a scorecard
- Budget watch: hours log, alerts and an out-of-scope check
- Deal memory: flag clauses you have seen before
- Local-first processing with redaction before any outside call

**Out of scope (v1)**

Legal advice, bespoke contract drafting, payments and invoicing, sending messages to clients (you always send), meeting recording, accounts and billing, team features.

**Social implication.** Freelancers usually negotiate alone against clients who negotiate every day. Jhanjhat narrows that gap without making anyone aggressive: the aim is clear terms, which also helps the client. Negotiation coaching is normally available to people with mentors or money, and a voice rehearsal tool in English and Hinglish makes it available to anyone with a laptop. Contracts are sensitive, so reasoning and storage are local by default and the app lists exactly what leaves the machine.

## Features and status

<!-- Edit this table so it matches what runs in your build. -->

| Feature | Status |
|---|---|
| Deal analysis: risky clauses, hidden work, hours (low / likely / high), hidden costs, effective hourly rate, take / renegotiate / walk, draft reply in English or Hinglish | ✅ |
| Quote verification and code-computed maths | ✅ |
| Practice Room: ElevenLabs voice call with a pretend client, then a scorecard | ✅ |
| Budget watch: hours log, 70 / 90 / 100 percent alerts, out-of-scope check | ✅ |
| Deal memory: pgvector hybrid search for clauses seen in earlier deals | ✅ |
| Redaction before any outbound call | ✅ |
| Landing page with GSAP and Lenis (landing only) | ✅ |
| Agreement draft from chat, using a fixed template | 🚧 |
| Chrome extension for meeting capture | ❌ cut for time |
| Public web search for similar stories | ❌ cut for time |
| Accounts and billing | ❌ cut for time |

### Deal analysis

Paste a contract, a brief or a chat. One Gemma call returns structured JSON (validated with Zod, one retry) containing:

- a **risk score** from 0 to 100
- **risky clauses**: unlimited revisions, payment after launch, vague deliverables, no kill fee, unclear IP, no deadline-change terms, missing exclusions. Each one carries an exact quote from your text.
- **hidden work items** the client never listed
- **hours** as low, likely and high for each item
- **hidden costs**: revisions, meetings, back-and-forth, delayed payment, tools, taxes
- the **effective hourly rate** against your minimum
- a **decision**: TAKE, RENEGOTIATE or WALK, with a counter-offer and a draft reply

### Practice Room

One tap starts a live voice call with a pretend client. The risks found in the analysis become the client's hidden asks, and a persona (scope creeper, budget haggler, ghost payer, micromanager, vague brief) sets how it pushes. After the call you get a scorecard: where you gave things away for free (with the quote), which boundaries you held, and **three rewrites** of your weakest replies.

### Budget watch

Log hours against the estimate. A banner alerts you at 70, 90 and 100 percent of the likely hours, and whenever your effective rate drops below your minimum. An **out-of-scope check** takes a new client request and answers IN_SCOPE or OUT_OF_SCOPE with the quote, a suggested price and a reply draft.

### Deal memory

After each analysis, the clauses are embedded and stored. When you analyze a new deal, a hybrid search (70 percent vector similarity, 30 percent full-text rank) shows a "you have seen this before" card for similar clauses in earlier deals.

## How it works

### System overview

```mermaid
flowchart LR
  subgraph LOCAL["Your machine"]
    UI["Browser UI (Next.js)"]
    API["Next.js server routes"]
    RED["Redactor (plain code)"]
    OLL["Ollama: Gemma"]
    PG[("PostgreSQL + pgvector")]
  end
  subgraph CLOUD["Outside your machine"]
    OR["OpenRouter embeddings"]
    EL["ElevenLabs agent"]
  end
  UI --> API
  API --> OLL
  API --> PG
  API --> RED
  RED -->|"redacted chunks"| OR
  OR -->|"1024-dim vectors"| API
  API -->|"signed URL + sanitized variables"| UI
  UI <-->|"live audio"| EL
  EL -.->|"transcript fetched after the call"| API
```

### Analyzing a deal

```mermaid
sequenceDiagram
  actor U as Freelancer
  participant W as Next.js server
  participant G as Gemma (Ollama)
  participant V as Verifier (code)
  participant R as Redactor
  participant O as OpenRouter
  participant D as Postgres + pgvector
  U->>W: Paste contract, brief or chat
  W->>G: Extract clauses, work items, hours (JSON schema)
  G-->>W: Structured JSON
  W->>V: Check every quote against the source text
  V-->>W: Verified items + count of dropped items
  W->>W: Compute rate, totals and alerts (plain TypeScript)
  W->>R: Clause texts for memory
  R-->>W: Redacted texts
  W->>O: One batched embeddings request
  O-->>W: 1024-dimension vectors
  W->>D: Store text + vector + tsv
  W->>D: Hybrid search for earlier similar clauses
  D-->>W: Matches
  W-->>U: Analysis, decision, draft reply, "seen before" card
```

### Practising the call

```mermaid
sequenceDiagram
  actor U as Freelancer
  participant B as Browser
  participant S as Next.js server
  participant G as Gemma (Ollama)
  participant E as ElevenLabs agent
  U->>B: Start practice
  B->>S: Request a session for this deal
  S->>G: Build a sanitized scenario (no names, no contact details)
  S->>S: Redact, then pick hidden asks from the risky clauses
  S->>E: Request a signed URL
  E-->>S: Signed URL
  S-->>B: Signed URL + dynamic variables
  B->>E: Live voice call (max 5 minutes)
  E-->>B: Client voice replies
  B->>S: Call ended (conversation id)
  S->>E: Fetch transcript (retry up to about 30 seconds)
  S->>G: Score the freelancer's replies
  G-->>S: Scorecard JSON
  S->>S: Verify quotes, store turns and scorecard
  S-->>U: Scorecard: free concessions, boundaries held, 3 rewrites
```

The browser talks straight to the ElevenLabs agent. There is no custom speech-to-text, text-to-speech or LLM proxy in between, so there is no extra hop and no API key in the browser.

## The trust model

A local model can be wrong, so Jhanjhat does not rely on it for anything that involves money or quoting.

| Concern | How it is handled |
|---|---|
| The model invents a quote | Every clause and work item must quote the source. Quotes are matched against the original text in code, tolerating curly quotes and whitespace but not wording. Unmatched items are dropped and counted. |
| Wrong maths | Hours totals, hourly rate, thresholds and alerts are plain TypeScript, never model output. |
| A hallucinated amount in a draft reply | Every currency amount in a draft is checked against the computed numbers before it is shown. |
| Malformed JSON | Zod schema validation, one automatic retry, then a clear error. |
| Over-confidence | Analysis pages carry a "not legal advice" notice, and recommendations stick to commercial terms. |

## Privacy: what leaves your machine

Everything not listed below stays local: your pasted text, the analysis, the database, and every Gemma call.

| Destination | What is sent | When | Protection |
|---|---|---|---|
| OpenRouter | Redacted clause texts for embeddings | After each analysis | The redactor strips emails, phone numbers, UPI IDs, PAN, GSTIN, Aadhaar-like numbers, bank account numbers and tokenized URLs before sending. One batched request per deal. |
| ElevenLabs | A sanitized scenario as agent variables, plus your live voice during the call | When you start a practice call | Local Gemma removes names and contact details first. The call is capped at 5 minutes. |

The app has a **"What left this machine"** view that shows the exact redacted text that was sent for embeddings. Check ElevenLabs and OpenRouter's own data policies before using real client material.

## Tech stack

| Layer | Choice |
|---|---|
| App | Next.js (App Router), React, TypeScript |
| UI | Tailwind CSS, shadcn/ui, Hallmark design tokens |
| Landing motion | GSAP and Lenis, on the landing page only, off for reduced-motion users, kill switch via `NEXT_PUBLIC_SMOOTH_SCROLL` |
| Reasoning | Gemma, local, through Ollama's OpenAI-compatible API |
| Embeddings | OpenRouter, `openai/text-embedding-3-small` at 1024 dimensions |
| Voice | ElevenLabs Agents, `@elevenlabs/react` |
| Database | PostgreSQL with pgvector (Docker), Prisma |
| Validation | Zod |
| Tests | Vitest |

## Data model

The authoritative definition is `prisma/schema.prisma`.

```mermaid
erDiagram
  DEAL ||--o{ CLAUSE : has
  DEAL ||--o{ WORK_ITEM : has
  DEAL ||--o{ HOURS_LOG : tracks
  DEAL ||--o{ CHUNK : remembers
  DEAL ||--o{ SIMULATION : practised_in
  SIMULATION ||--o{ SIMULATION_TURN : contains
  SIMULATION ||--o| SCORECARD : produces
  DEAL {
    string title
    text sourceText
    int riskScore
    string decision
  }
  CLAUSE {
    string type
    text quote
    string severity
  }
  WORK_ITEM {
    string name
    float hoursLow
    float hoursLikely
    float hoursHigh
  }
  CHUNK {
    text text
    vector embedding
    tsvector tsv
    string embeddingModel
  }
```

Two details matter. Raw text is stored next to every vector, because text is needed for display, quote verification, keyword search and re-embedding. And every chunk stores `embeddingModel`, so vectors from different models are never mixed in one search.

## Repository layout

<!-- Adjust to your actual folders. -->

```
.
├── apps/
│   └── web/                  # Next.js app: UI, API routes, landing page
├── packages/
│   ├── ai/                   # LLM client (Ollama), embeddings client (OpenRouter), prompts
│   ├── db/                   # Prisma schema, migrations, repositories (all raw SQL lives here)
│   └── shared/               # Zod schemas, redactor, quote verifier, hours maths
├── docker-compose.yml        # Postgres + pgvector
├── .env.example
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 or newer and pnpm
- Docker
- [Ollama](https://ollama.com) with a Gemma model, and enough RAM or GPU to run it
- An [OpenRouter](https://openrouter.ai) API key with a few dollars of credit (embeddings are fractions of a cent per deal)
- An [ElevenLabs](https://elevenlabs.io) account and an agent (see below)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start Postgres with pgvector
docker compose up -d

# 3. Pull your local model (use the Gemma tag you prefer; check the Ollama library)
ollama pull <gemma-model-tag>

# 4. Configure environment variables
cp .env.example .env
# then edit .env (see the table below)

# 5. Create the schema and load demo data
pnpm db:migrate
pnpm db:seed

# 6. Run the app
pnpm dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/jhanjhat` | Local Postgres |
| `LLM_BASE_URL` | `http://localhost:11434/v1` | Ollama's OpenAI-compatible endpoint |
| `LLM_MODEL` | `<gemma-model-tag>` | The model tag from `ollama list` |
| `EMBED_BASE_URL` | `https://openrouter.ai/api/v1` | Embeddings endpoint |
| `EMBED_API_KEY` | `sk-or-...` | OpenRouter key (server only) |
| `EMBED_MODEL` | `openai/text-embedding-3-small` | Use a paid model, not a `:free` route |
| `EMBED_DIM` | `1024` | Must match the `vector(1024)` column. The app fails at startup if they differ. |
| `ELEVENLABS_API_KEY` | `...` | Server only, used to request signed URLs and fetch transcripts |
| `ELEVENLABS_AGENT_ID` | `agent_...` | Your agent |
| `NEXT_PUBLIC_SMOOTH_SCROLL` | `true` | Set to `false` to disable Lenis and GSAP scroll effects |

No secret is ever sent to the browser.

### Check your embeddings setup

```bash
curl https://openrouter.ai/api/v1/embeddings \
  -H "Authorization: Bearer $EMBED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/text-embedding-3-small","input":["payment after launch"],"dimensions":1024}'
```

The response must contain an `embedding` array of exactly 1024 numbers.

## Configuring the ElevenLabs agent

Create one agent in the ElevenLabs dashboard and set:

- **Authentication on** (signed URLs), since the server issues the URL
- **Max call duration:** 5 minutes
- **No tools and no knowledge base**, to keep latency low
- A fast LLM option, since a role-play client does not need deep reasoning
- **First message:** `Hello {{freelancer_name}}, thanks for hopping on. So, about the project...`
- **Default values** for every dynamic variable, so the dashboard test button works

The app passes these dynamic variables at session start: `client_name`, `freelancer_name`, `persona`, `difficulty`, `project_brief`, `hidden_asks`, `budget_ceiling`.

<details>
<summary>Agent system prompt</summary>

```
You are {{client_name}}, a client on a live phone call with {{freelancer_name}}, a freelancer you hired. You are NOT an assistant. Never say you are an AI.

PROJECT
{{project_brief}}

YOUR PERSONA: {{persona}}. DIFFICULTY: {{difficulty}} out of 3.
HIDDEN AGENDA: {{hidden_asks}}. Slip these in naturally during the call; never announce them as a list.
BUDGET CEILING: {{budget_ceiling}}. Never reveal it. Only move toward it if the freelancer holds firm with clear reasons.

PERSONA BEHAVIOR
- Scope Creeper: calls everything simple, keeps adding features mid-sentence.
- Budget Haggler: anchors low, compares to other freelancers, asks for discounts.
- Ghost Payer: vague on payment dates and advance, avoids written terms.
- Micromanager: asks for constant updates, changes direction, wants approval on every detail.
- Vague Brief: cannot describe what he wants, contradicts earlier statements.

HOW YOU SPEAK
- Live voice call: 1 to 3 short sentences, no lists, no stage directions, no emojis.
- Mirror the freelancer's language. If they speak Hinglish, reply in Hinglish.
- Speak like a normal client, not a caricature. Use natural phrasing and rupee amounts.
- Stay in character the whole call. Never coach, explain, or give feedback.

HOW YOU ESCALATE
- Start friendly, then push on gaps in scope, price, deadline and payment.
- If the freelancer states scope, price and boundaries clearly and politely, soften slightly.
- If the freelancer agrees to extra work for free, ask for more.
- If they stay vague, push harder.
- Difficulty 1: gentle. Difficulty 2: persistent, interrupts sometimes. Difficulty 3: pushy, interrupts often, brings up hidden asks early, concedes rarely.

ENDING
- If the freelancer wraps up clearly (scope, price, next steps), close the call naturally.
- If the call goes over 5 minutes, wrap up politely.
```

</details>

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the app in development |
| `pnpm build` | Production build |
| `pnpm typecheck` | Type-check every package |
| `pnpm test` | Run the unit tests |
| `pnpm db:migrate` | Apply Prisma migrations, including the pgvector extension and HNSW and GIN indexes |
| `pnpm db:seed` | Load the demo deals |
| `pnpm db:reset-demo` | Wipe and reseed, so you can repeat a demo take |

## Demo walkthrough

The seed script loads three demo deals: one with **payment after launch**, one with **unlimited revisions**, and one with steady **scope creep**.

1. Open a seeded deal and read the risk score. Click a risky clause to see its exact quote in the source.
2. Check the hours range and the effective hourly rate against the minimum.
3. Read the decision and the draft reply. Every amount in it matches the computed numbers.
4. Open **Practice**, start the call, and say yes too easily to one request. Finish the call.
5. Read the scorecard: the free concession is flagged with your own words, followed by three rewrites.
6. Log hours on the deal until the 70 percent banner appears.
7. Open the **Memory** page to see stored chunks, and run this in any Postgres client to see vectors next to text:

```sql
SELECT id, left(text, 60) AS text, "embeddingModel", vector_dims(embedding) AS dims
FROM "Chunk" ORDER BY "createdAt" DESC LIMIT 5;
```

## Testing

```bash
pnpm typecheck
pnpm test
pnpm build
```

The unit tests focus on the deterministic parts that must never be wrong: the quote verifier, the redactor, the hours and rate maths, and the check on amounts in drafted replies. Model output itself is validated at runtime with Zod instead of being trusted.

## Troubleshooting

| Problem | Fix |
|---|---|
| Connection refused to the LLM | Run `ollama serve` and check `LLM_BASE_URL` and `LLM_MODEL` against `ollama list`. |
| Analysis is slow | Long contracts on a local model take time. Try a smaller Gemma variant. |
| "Embedding dimension mismatch" at startup | `EMBED_DIM` must be 1024 and the model must return 1024 numbers. Run the curl check above. |
| OpenRouter 402 or 429 | Add credit or wait. Chunks stay pending and are retried in the background, and the deal page keeps working without them. |
| `extension "vector" is not available` | Use the `pgvector/pgvector` Docker image from `docker-compose.yml`. |
| Voice call will not start | Allow microphone access, confirm `ELEVENLABS_AGENT_ID`, and make sure authentication is on for the agent and every variable has a default. |
| Scorecard is empty | The transcript can lag. The server retries for about 30 seconds, so reopen the scorecard shortly after. |

## Limitations and responsible use

- **Not legal advice.** Jhanjhat reads commercial terms. It does not replace a lawyer, and nothing it produces is a legal document.
- **Models make mistakes.** The quote checks and code-based maths reduce the risk, but you should read the clauses yourself before acting.
- **Needs a capable machine** to run Gemma locally.
- **Two cloud touchpoints** (embeddings and voice) send limited, redacted data. Read the Privacy section and the providers' policies.
- **No hosted demo by design.** The project is local-first, so the demo is the video and this repository.
- **Personas are behaviours, not people.** They describe how a client negotiates, never a group of people.

## Roadmap

- Plain-language agreement drafts from agreed chat terms, using a fixed, lawyer-reviewed template
- Meeting capture with a Chrome extension, so out-of-scope requests are flagged from real calls
- Estimated vs actual hours from finished projects, so quotes improve with every deal
- Late-payment reminders in the right tone
- A fully local embeddings option, so nothing leaves the machine except voice

## Prior art and acknowledgements

[Panga by Reet Singh](https://dev.to/reet_singh_ee97da2986538e/simple-site-hai-15k-mein-ho-jayega-na-i-built-panga-so-freelancers-stop-saying-yes-too-fast-5454) explores a related idea: finding hidden work in a brief and chat, pricing it, and rehearsing the call. Jhanjhat takes a different direction, with local-first processing, contract risk analysis, budget alerts and a verified-quote approach.

Built with [Gemma](https://ai.google.dev/gemma), [Ollama](https://ollama.com), [OpenRouter](https://openrouter.ai), [ElevenLabs](https://elevenlabs.io), [Next.js](https://nextjs.org), [Prisma](https://www.prisma.io), [pgvector](https://github.com/pgvector/pgvector), [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering).

## License

MIT. See `LICENSE`.
