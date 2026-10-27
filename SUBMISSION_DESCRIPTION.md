# Jhanjhat (झंझट) — Submission Description

## Project Name
**Jhanjhat** (झंझट) — Commercial Deal Intelligence & Voice Negotiation Sparring for Freelancers

## Short Pitch / Tagline
*Read the deal, count the real hours, rehearse the call out loud — before you say yes.*

---

## Inspiration & Story
It is 8:15 PM on a Monday. A client calls asking for a "simple landing page" for ₹8,000.
*"Ho jayega, ma'am."*
Two seconds later: *"Ek order form bhi chahiye, aur payment launch ke baad kar denge, theek hai?"*
You say *"haan, dekhte hain."* She hears yes.

Three weeks later, the 10-hour job has consumed 41 hours. The order form expanded into a backend inventory integration, there were four rounds of subjective design revisions, and your effective rate collapsed to ₹195/hr while payment is indefinitely delayed.

Nothing in this scenario was a software bug. The money was surrendered in two seconds of unpracticed silence on a live phone call and in contract clauses nobody read closely.

*Jhanjhat* is the Hindi term for this polite, uninvited hassle. We built Jhanjhat as a private, local-first negotiation shield for solo freelancers, consultants, and boutique studios before they commit to fixed-price trap deals.

---

## What It Does

1. **Deterministic Deal Analysis:** Paste any raw client brief, contract, or message transcript. Local **Gemma** parses risky clauses (unlimited revisions, delayed payments, undefined IP, vague deliverables) and uncovers hidden work items.
2. **Quote Verification Engine:** Every extracted clause is matched character-by-character in plain TypeScript against the original source document. If the LLM hallucinates terms that do not exist, the verifier automatically drops them.
3. **Mathematical Guardrails:** Total hours, hourly floor differentials, and effective rates are computed via deterministic TypeScript math — never entrusted to generative AI hallucinations.
4. **Voice Sparring Practice Room:** Rehearse the negotiation out loud against an AI client persona powered by **ElevenLabs Conversational AI** over low-latency WebSockets. The AI client is armed with the contract's actual hidden traps and tests your boundaries.
5. **Debrief Scorecard & Tactical Rewrites:** After the call, get scored on boundaries defended, free concessions surrendered (with exact transcript quotes), and receive 3 calibrated counter-anchor rewrites.
6. **Budget Watch & Scope Creep Sentinel:** Track logged hours against estimates with automated threshold alerts (70%, 90%, 100%, and sub-minimum rate warnings). The **Out-of-Scope Check** instantly classifies new client requests as `IN_SCOPE` or `OUT_OF_SCOPE` with suggested add-on pricing.
7. **Deal Memory via pgvector:** Historical clauses are indexed into PostgreSQL using **pgvector** (1024-dimension HNSW cosine indexing + GIN full-text search) to flag recurring trap patterns across clients.

---

## How We Built It

- **Frontend & App Architecture:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Hallmark design tokens, GSAP kinetic stagger animations, and Lenis smooth scrolling (with strict `prefers-reduced-motion` compliance).
- **Local AI Reasoning:** Google's **Gemma** model running locally via Ollama's OpenAI-compatible endpoint.
- **Voice Agent:** **ElevenLabs Conversational AI SDK** (`@elevenlabs/react`) utilizing ephemeral, server-minted signed URLs with dynamic scenario variables.
- **Data & Vector Storage:** PostgreSQL with `pgvector` extension running HNSW cosine similarity search (`vector_cosine_ops`) and Prisma ORM.
- **Embeddings:** OpenRouter `openai/text-embedding-3-small` with a deterministic fallback vectorizer.
- **Privacy Engine:** Client-side and edge regex redactors that strip Indian PAN, Aadhaar, GSTIN, UPI IDs, emails, phone numbers, and URLs before any chunk text touches an external API.

---

## Challenges We Ran Into

- **Quote Hallucinations:** Generative models often paraphrase or invent contract terms. We solved this with a strict two-pass quote verification engine that rejects any clause whose quote does not appear verbatim in the source contract.
- **Real-Time Voice Rehearsal in the Browser:** Integrating low-latency voice negotiation required careful WebRTC/WebSocket state coordination. We wrapped the room in `@elevenlabs/react`'s `ConversationProvider`, engineered server-minted signed token handshakes, and built local speech turn caching to guarantee immediate scorecards even during network latency.
- **Privacy Guarantees:** Freelance agreements contain sensitive commercial terms and client identities. We ensured local-first processing where contracts and reasoning stay on the developer's machine, with PII redaction on any outbound embedding request.

---

## Accomplishments We're Proud Of

- Zero-trust architecture between LLM output and business logic: financial maths and quote verification are 100% deterministic code.
- Fully working real-time conversational voice sparring with natural client personas.
- Hybrid search over historical contracts combining dense vectors and full-text search.
- Clean, accessible design system with dark/light themes, keyboard accessibility, and respect for motion preferences.

---

## What We Learned

- How to design human-in-the-loop interfaces where AI suggests commercial decisions but deterministic code enforces the guardrails.
- How to orchestrate real-time conversational agents using ElevenLabs' modern WebRTC/WebSocket infrastructure.
- Practical vector database schema design with PostgreSQL HNSW indexing alongside Prisma.

---

## What's Next for Jhanjhat

- Standardized legal contract generation from agreed chat terms using vetted open-source freelance agreements.
- Chrome extension for real-time Google Meet / Zoom negotiation guidance.
- Multi-currency support and localized freelance rate benchmark indices.

---

## Prize Categories Targeted
- **Best Use of Gemma 4** (Local-first structured extraction, quote parsing, and contract intelligence)
- **Best Open-Source AI Project**
