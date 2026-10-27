# Jhanjhat (झंझट)

<p align="center">
  <strong>Read the deal, count the hours, rehearse the call — before you say yes.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Local_AI-Gemma_via_Ollama-blue?style=flat-square&logo=google" alt="Gemma" />
  <img src="https://img.shields.io/badge/Voice_AI-ElevenLabs_Agents-orange?style=flat-square" alt="ElevenLabs" />
  <img src="https://img.shields.io/badge/Vector_DB-Postgres_pgvector-336791?style=flat-square&logo=postgresql" alt="pgvector" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

## 💡 The Problem in 30 Seconds

A client calls with a "simple landing page" for **₹8,000**.
*“Ho jayega, ma'am.”*
Two seconds later: *“Ek order form bhi chahiye, aur payment launch ke baad kar denge, theek hai?”*

Three weeks later: the 10-hour job took 41 hours. The order form became an inventory system, there were four redesign rounds, and your effective rate collapsed to **₹195/hr**. The money was not lost in bad code — it was lost in two seconds of unpracticed silence on a phone call.

**Jhanjhat** is the local-first negotiation shield for freelancers:
1. **Analyze Deals:** Quotes are extracted, verified verbatim against source text, and code-calculated into realistic hours ranges and effective rates.
2. **Rehearse Out Loud:** Hop into an ultra-low latency voice call with an AI client persona (ElevenLabs) armed with the contract's hidden traps.
3. **Get Scored:** Review boundaries held, free concessions made, and get 3 tactical counter-rewrites.

---

## ⚡ Architecture & How It Works

### 1. Privacy-First System Flow

Your raw contracts and client chats stay **strictly local**. The Next.js backend and local Gemma model handle intelligence on-device.

```mermaid
flowchart TD
    subgraph LOCAL[" 🔒 YOUR LOCAL MACHINE (Default & Private) "]
        direction TB
        UI["🖥️ Web UI<br/><i>Next.js 14 + Tailwind</i>"]
        SRV["⚡ App Engine<br/><i>API Routes & TypeScript Maths</i>"]
        RED["🛡️ Privacy Redactor<br/><i>Strips PAN, GST, UPI, Names, Phone</i>"]
        LLM["🧠 Gemma (Ollama)<br/><i>Local Clause & Work Extraction</i>"]
        DB[("💾 PostgreSQL + pgvector<br/><i>HNSW Cosine Index · 1024D</i>")]
    end

    subgraph CLOUD[" ☁️ EXTERNAL SERVICES (Zero Unredacted Data) "]
        EMB["🌐 OpenRouter Embeddings<br/><i>text-embedding-3-small</i>"]
        VOICE["🎙️ ElevenLabs Conversational AI<br/><i>Signed WebSocket Session</i>"]
    end

    UI -->|"Raw contract paste"| SRV
    SRV -->|"Prompt schema"| LLM
    LLM -->|"Extracted clauses & hours"| SRV
    SRV -->|"Persist deal & chunks"| DB
    SRV -->|"Clean text"| RED
    RED -->|"Redacted snippet"| EMB
    EMB -->|"1024D Vector"| DB

    SRV -->|"Issue signed session URL"| UI
    UI <-->|"Live WebRTC / Audio"| VOICE
    VOICE -.->|"End-of-call transcript"| SRV

    classDef localBox fill:#111827,stroke:#3b82f6,stroke-width:1.5px,color:#f3f4f6;
    classDef cloudBox fill:#18181b,stroke:#f59e0b,stroke-width:1.5px,color:#f3f4f6;
    class LOCAL localBox;
    class CLOUD cloudBox;
```

---

### 2. Deal Analysis Sequence

Every extracted clause quote is verified in plain code against the source document. If the LLM hallucinates an unquoted clause, the verifier drops it.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as 🧑‍💻 Freelancer
    participant App as 🖥️ Jhanjhat Server
    participant Gemma as 🧠 Local Gemma
    participant V as 🔍 Quote Verifier
    participant DB as 🗄️ pgvector DB

    Dev->>App: Paste contract or brief
    App->>Gemma: Analyze clauses & hidden work items
    Gemma-->>App: Structured JSON response
    App->>V: Match quotes character-by-character
    V-->>App: Verified clauses (dropped unverified)
    App->>App: Calculate low/likely/high hours & effective rate
    App->>DB: Store project & generate HNSW embedding
    App->>DB: Hybrid search (70% Vector + 30% GIN Fulltext)
    DB-->>App: Historical duplicate clauses found
    App-->>Dev: Deal Decision: TAKE · RENEGOTIATE · WALK
```

---

### 3. Voice Sparring & Scorecard

```mermaid
sequenceDiagram
    autonumber
    actor Dev as 🧑‍💻 Freelancer
    participant Browser as 🌐 Client Browser
    participant App as ⚡ Jhanjhat Backend
    participant Eleven as 🎙️ ElevenLabs Agent

    Dev->>Browser: Select Persona & Click "Start Voice Sparring"
    Browser->>App: Request signed practice session
    App->>Eleven: GET /v1/convai/conversation/get_signed_url
    Eleven-->>App: wss:// signed session URL
    App-->>Browser: Session token + Redacted context
    Browser<<->>Eleven: 🗣️ Real-time voice sparring (max 5 min)
    Dev->>Browser: Click "End Session & Evaluate"
    Browser->>App: Fetch debrief with conversation ID
    App->>Eleven: Query call transcript
    App->>App: Score boundaries, free concessions & tactical rewrites
    App-->>Dev: Debrief Scorecard + 3 Anchor Rewrites
```

---

## 🎯 Feature Matrix

| Feature | Description | Status |
|---|---|:---:|
| **Deal Analysis** | Extracts risky clauses, hidden tasks, scope creep items, and rates | ✅ Verified |
| **Quote Verifier** | Verbatim matching against contract text; drops AI hallucinations | ✅ Verified |
| **Deterministic Maths** | Total hours & effective rate calculated in TypeScript, not LLM guesses | ✅ Verified |
| **Voice Practice Room** | Live audio rehearsal with ElevenLabs conversational agent | ✅ Verified |
| **Negotiation Scorecard** | Tracks concessions surrendered, boundaries defended & 3 rewrites | ✅ Verified |
| **Budget Watch** | Logs actual hours; triggers alerts at 70%, 90%, 100% and below-floor rates | ✅ Verified |
| **Out-of-Scope Check** | Instant check on new client messages: `IN_SCOPE` vs `OUT_OF_SCOPE` with pricing | ✅ Verified |
| **Deal Memory** | PostgreSQL pgvector hybrid search across prior contract clauses | ✅ Verified |
| **Privacy Redactor** | Regex redaction for PAN, Aadhaar, GSTIN, UPI, emails, and phone numbers | ✅ Verified |
| **Kinetic Landing Page** | GSAP staggered reveals and smooth Lenis scrolling with reduced-motion support | ✅ Verified |

---

## 🗄️ Data Model

```mermaid
erDiagram
    Project ||--o{ Document : contains
    Project ||--o{ Analysis : yields
    Project ||--o{ HoursLog : tracks
    Project ||--o{ Simulation : records
    Analysis ||--o{ Clause : flags
    Analysis ||--o{ HiddenWorkItem : uncovers
    Document ||--o{ DocumentChunk : indexes
    Simulation ||--o| Scorecard : generates

    Project {
        string id PK
        string title
        string clientName
        float budgetAmount
        float hourlyRate
        string status
    }
    Clause {
        string id PK
        string category
        text quote
        int riskWeight
    }
    DocumentChunk {
        string id PK
        text content
        vector embedding
        tsvector searchVector
    }
    Simulation {
        string id PK
        string persona
        int difficulty
        string conversationId
    }
    Scorecard {
        string id PK
        int overallScore
        json rewrites
    }
```

---

## 🚀 Quickstart

### 1. Prerequisites
- **Node.js 20+** and **pnpm**
- **Docker** (for PostgreSQL + pgvector)
- **Ollama** running locally with `ollama pull gemma4:12b` (or your preferred Gemma model)
- **ElevenLabs API Key & Agent ID** (optional, for live voice sparring)

### 2. Setup

```bash
# Clone the repository
git clone https://github.com/mannubaveja007/Jhanjhat.git
cd Jhanjhat

# Install dependencies
pnpm install

# Start local PostgreSQL with pgvector
docker compose up -d

# Configure environment variables
cp .env.example .env.local

# Push schema and seed demo deals
pnpm db:push
pnpm db:seed

# Launch development server
pnpm dev
```

Visit [`http://localhost:3000`](http://localhost:3000) to open the app.

---

## 🔐 Privacy & Trust Model

| Outside Destination | What is Sent | How It Is Protected |
|---|---|---|
| **OpenRouter** | Redacted chunk text for 1024D embeddings | PII, phone numbers, emails, PAN, GSTIN stripped beforehand. One batched request. |
| **ElevenLabs** | Redacted contract brief, dynamic client persona variables | Session initiated via server-minted signed URL; no API keys exposed to browser. |
| **Local Machine** | Everything else: contract text, clauses, analyses, rates, and SQLite/PostgreSQL storage | Runs entirely on your hardware. |

*Disclaimer: Jhanjhat provides commercial deal intelligence and negotiation rehearsal for informational purposes only, not legal or financial advice.*

---

## 📜 License

[MIT](LICENSE) © 2026 Mannu Baveja. Built for Hacktoberfest Hack Day 2026.
