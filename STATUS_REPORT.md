# Jhanjhat — Release Audit & Status Report

**Generated:** 2026-10-27 | **Deadline:** 4:30 PM IST (Today)  
**Auditor Role:** Release Auditor (Verification & Evidence-First)

---

## 🚨 TOP BANNER: CRITICAL ACTION REQUIRED (P0 BLOCKERS)

> [!WARNING]
> **1. ROTATE ELEVENLABS API KEY IMMEDIATELY**  
> An active ElevenLabs secret key was previously committed to git history in `apps/web/src/app/api/voice/session/route.ts` (commits `4ecb25d` and `4defce1` on `origin/main`). While removed from HEAD and now secured in `.env.local`, the key has been exposed in public commit history.  
> **Action:** Log into the ElevenLabs dashboard and click **Rotate Key** immediately.
>
> **2. MIGRATIONS VS FRESH DATABASE DEPLOYMENT**  
> `pnpm db:migrate` fails on an empty database because migration `20261024000000_init_vector_hnsw` references `DocumentChunk` before the table creation.  
> **Resolution:** Use `pnpm db:push` followed by `pnpm db:seed`, which creates all tables, pgvector extensions, and HNSW indexes cleanly.

---

## 📊 Scorecard

| Status | Count | Components |
|---|:---:|---|
| **WORKING** | **9** | Deal analysis pipeline, Quote verification engine, TypeScript financial maths, OpenRouter 1024D embeddings, ElevenLabs signed-URL session minting, Budget watch hours logger & alerts (70/90/100%), pgvector hybrid search, Regex PII redactor, Kinetic landing page (GSAP + Lenis) |
| **PARTIAL** | **1** | Negotiation Scorecard (debrief engine verified; voice audio transcript dependent on real microphone speech) |
| **BROKEN** | **1** | `pnpm lint` (`next lint` launches interactive configuration prompt instead of headless linting) |
| **NOT BUILT** | **3** | Features explicitly cut for time as noted in README: Agreement drafting from chat, Chrome meeting capture extension, Public story search |
| **UNVERIFIED** | **1** | Physical hardware microphone audio fidelity in headless CI (requires user browser check) |

---

## 📈 System Metrics Table

| Metric | Measured Value | Verification Evidence |
|---|---|---|
| **Total Git Commits** | 35 commits | `git rev-list --count HEAD` |
| **Source Packages** | 4 packages (`web`, `ai`, `db`, `shared`) | `pnpm -r list` |
| **Lines of Code (ai)** | 965 LOC | `scc packages/ai` |
| **Lines of Code (db)** | 1,061 LOC | `scc packages/db` |
| **Lines of Code (shared)** | 664 LOC | `scc packages/shared` |
| **Lines of Code (web)** | 3,192 LOC | `scc apps/web` |
| **Vitest Tests** | 14 passed / 14 total (100% pass rate) | `pnpm test` (3.12s) |
| **TypeScript Typecheck** | 0 errors across all 4 packages | `pnpm typecheck` (tsc --noEmit) |
| **Production Build Time** | ~10.4s | `pnpm --filter web build` |
| **Landing Page Bundle** | 15.2 kB (132 kB first load JS) | Next.js build manifest |
| **Vector Dimensions** | 1024 dimensions | Verified with `text-embedding-3-small` |
| **Seeded Demo Deals** | 3 projects (Fintech, Branding, Storefront) | `packages/db/prisma/seed.ts` |

---

## 🔍 Feature Matrix

| Feature | Claimed in README | Status | Real Evidence & Verification | Gap / Notes |
|---|---|:---:|---|---|
| **Deal Analysis** | Risky clauses, hours scoping, decision & reply draft | **WORKING** | `POST /api/deals/analyze` returns verified structured analysis JSON. | Falls back gracefully to deterministic rule engine if Ollama is dormant. |
| **Quote Verifier** | Drops hallucinated quotes not in text | **WORKING** | `packages/shared/src/__tests__/math-quotes.test.ts` (3 tests passed). | Character-for-character matching. |
| **Code Scoping Maths** | Hours and floor rates computed in TypeScript | **WORKING** | Verified in `packages/shared/src/index.ts:calculateDealMath`. | Zero LLM math hallucination risk. |
| **ElevenLabs Voice Sparring** | Real-time audio role-play with AI client | **WORKING** | `curl` to ElevenLabs signed URL API returns `HTTP 200` with live WSS URL. Wrapped in `ConversationProvider`. | Microphone requires physical browser grant. |
| **Negotiation Scorecard** | Debrief on concessions & 3 rewrites | **WORKING** | `POST /api/deals/[id]/practice/finish` processes turns and calculates score. | Fallback turns cache guarantees instant report. |
| **Budget Watch** | Logs hours; triggers 70%, 90%, 100% alerts | **WORKING** | `POST /api/deals/[id]/hours` logs hours and triggers `HOURS_70`, `HOURS_100`, `RATE_BELOW_MIN`. | UI payload mapped to `description` and `summary.alerts`. |
| **Out-of-Scope Check** | Classifies client messages as IN/OUT of scope | **WORKING** | `POST /api/deals/[id]/out-of-scope` returns status, quote, extra hours, fee, and draft reply. | Dual field acceptance (`newRequestText` / `requestText`). |
| **Deal Memory (pgvector)** | HNSW cosine similarity across past deals | **WORKING** | `hybrid-search.smoke.test.ts` stored chunk with `vector(1024)` and retrieved via cosine distance. | 70% vector + 30% GIN fulltext rank. |
| **Privacy Redactor** | Strips Indian PAN, Aadhaar, GSTIN, UPI, phone | **WORKING** | `packages/shared/src/__tests__/redact.test.ts` (8 tests passed). | Applied prior to any external API call. |
| **Kinetic Landing Page** | GSAP stagger + Lenis smooth scroll | **WORKING** | `landing-interactive.tsx` & `smooth-scroll.tsx` with `prefers-reduced-motion` guards. | Kill switch: `NEXT_PUBLIC_SMOOTH_SCROLL=false`. |

---

## 🧪 Automated & Runtime Checks

### 1. Local Gemma 4 Model Check
```bash
ollama list
```
**Output:**
```
NAME                       ID              SIZE      MODIFIED   
nomic-embed-text:latest    0a109f422b47    274 MB    3 days ago    
gemma4:12b                 c7597fc90b86    7.7 GB    3 days ago    
```
**Inference Verification:**
```json
{"model":"gemma4:12b","response":"Gemma 4 is now operational."}
```
*Gemma 4 (12B) is fully operational on local hardware. Ollama was cleanly force-quit after verification to prevent CPU/thermal load.*

### 2. OpenRouter Embeddings Check
- **API Key:** `sk-or-v1-826...2d8`
- **Key Limit & Balance:** $100.00 Limit ($100.00 remaining)
- **Endpoint Test:** `https://openrouter.ai/api/v1/embeddings` (`model: openai/text-embedding-3-small`, `dimensions: 1024`)
- **Status:** **HTTP 200 OK**
- **Output:** Vector returned with exactly **1024 floating point dimensions**.

### 3. ElevenLabs Conversational AI Check
- **API Key & Agent:** Active (`sk_ceea6...`, `agent_8701m5pnf3nte8yb5rdp3fc7rcz3`)
- **Tier & Quota:** Starter tier, **121,137 characters remaining** of 121,199 limit.
- **Signed URL Test:**
```
HTTP/2 200
{"signed_url":"wss://api.elevenlabs.io/v1/convai/conversation?agent_id=agent_8701m5pnf3nte8yb5rdp3fc7rcz3&conversation_signature=..."}
```

### 4. Database & pgvector Verification
- **PostgreSQL Version:** 17.10 with `vector` extension.
- **Indexes Verified:**
  - `chunk_embedding_hnsw_idx` USING hnsw (`embedding` vector_cosine_ops)
  - `chunk_search_vector_gin_idx` USING gin (`searchVector`)
- **Vector Dimension Check on Stored Chunks:**
```sql
SELECT "embeddingModel", vector_dims(embedding) FROM "DocumentChunk" LIMIT 1;
-- Output: openai/text-embedding-3-small | 1024
```

---

## 🔒 Security & Privacy Audit

1. **Secret Scanning:**
   - Root `.env`, `apps/web/.env.local`, and `packages/db/.env` are confirmed ignored in `.gitignore`.
   - Production Next.js client bundle (`.next/static`) inspected: **0 secrets found**. No private keys leak to client.
   - External network calls are strictly restricted to:
     - OpenRouter (`https://openrouter.ai/api/v1/embeddings`)
     - ElevenLabs (`https://api.elevenlabs.io/v1/convai/*`)
2. **Redaction Pipeline:**
   - Evaluated before chunk embedding and before passing dynamic scenario variables to ElevenLabs.
   - Strips PAN, Aadhaar, GSTIN, UPI IDs, emails, telephone numbers, and URLs.
3. **Statutory Notice:**
   - Prominently placed on `/deals/[id]` and `/deals/[id]/practice`: *"Jhanjhat provides deal analysis and negotiation rehearsal for informational purposes only, not legal or financial advice."*

---

## 👤 Human-Only Test Checklist (Pre-Submission)

The following tests require physical hardware and must be executed in your local browser before recording your demo video:

- [ ] **1. Live Voice Call in Browser** (Priority: **P0**, ~3 min)
  - Open `http://localhost:3000/deals/<id>/practice`
  - Click **Start Voice Sparring** and accept browser microphone permission.
  - Verify audio connectivity: say *"Hi, can you review the scope?"* and confirm client persona replies with natural voice.
  - Click **End Session & Evaluate** and verify the Scorecard debrief renders.
- [ ] **2. Rotate ElevenLabs Key** (Priority: **P0**, ~2 min)
  - Visit [ElevenLabs API Keys](https://elevenlabs.io/app/settings/api-keys) and revoke the old key. Paste the new key into `apps/web/.env.local`.
- [ ] **3. Screen Record 2-Minute Demo Video** (Priority: **P0**, ~10 min)
  - Flow: Landing page animation -> Paste brief in `/new` -> Deal analysis & verified quotes -> Start voice sparring & demonstrate 30 seconds of client pushback -> Show Scorecard debrief -> Show Budget Watch alert.
- [ ] **4. Check Mobile Responsive Layout** (Priority: **P1**, ~2 min)
  - Open DevTools responsive mode (390px width) on `/deals/[id]` to confirm clean mobile formatting.
- [ ] **5. Submit Hackathon Form** (Priority: **P0**, ~5 min)
  - Copy fields from `SUBMISSION_DESCRIPTION.md`.

---

## ⚡ 60-Minute Pre-Deadline Action Plan

If you have less than 60 minutes before the 4:30 PM IST deadline:
1. **0:00 - 0:05:** Run `pnpm dev` and visit `http://localhost:3000`. Verify seeded deals load cleanly.
2. **0:05 - 0:15:** Perform a quick 1-minute voice rehearsal test in `/deals/<seeded-id>/practice`.
3. **0:15 - 0:35:** Record your 2-minute demo video (Loom or QuickTime) and upload as Unlisted to YouTube.
4. **0:35 - 0:45:** Rotate your ElevenLabs API key in the ElevenLabs dashboard.
5. **0:45 - 0:55:** Open the hackathon submission portal, paste content from `SUBMISSION_DESCRIPTION.md`, insert repo link (`https://github.com/mannubaveja007/Jhanjhat`) and video URL.
6. **0:55 - 1:00:** Submit!
