import { prisma } from "../client";
import { projectRepository } from "../repositories/project.repository";
import { analysisRepository } from "../repositories/analysis.repository";
import { chunkRepository } from "../repositories/chunk.repository";
import { analyzeDeal } from "@jhanjhat/ai";
import { embedAndStoreDealMemory, findSimilarPastDeals } from "@jhanjhat/ai";

export const DEMO_DEALS = [
  {
    title: "Fintech Mobile App & Web Platform",
    clientName: "Stealth FinTech Co.",
    budgetAmount: 3500,
    hourlyMinimum: 60,
    currency: "USD",
    tone: "ENGLISH" as const,
    rawContent: `MASTER SERVICES AGREEMENT - STEALTH FINTECH CO.
1. SCOPE OF SERVICES: Contractor will engineer and deploy the complete iOS mobile app, Android client, and responsive web management dashboard.
2. COMPENSATION & PAYMENT TERMS: Total fixed compensation for all deliverables shall be $3,500. Payment will be released strictly 45 days after the platform reaches 10,000 active verified users following public launch. In the event that the platform does not achieve 10,000 active users within six months of deployment, no payment shall be owed to Contractor.
3. CANCELLATION & TERMINATION: Client may terminate this agreement at any time for convenience. No kill fee or cancellation payment shall be provided regardless of completed milestones.
4. INTELLECTUAL PROPERTY: All code, designs, and architectures shall be considered work-for-hire and ownership shall vest exclusively in Client from the moment of creation.
5. DEADLINES: Contractor agrees to deliver all completed modules by December 1st without deadline adjustments.`,
  },
  {
    title: "Brand Identity & 10-Page Marketing Site",
    clientName: "HyperGrowth Digital Agency",
    budgetAmount: 1200,
    hourlyMinimum: 50,
    currency: "USD",
    tone: "HINGLISH" as const,
    rawContent: `HYPERGROWTH CLIENT SCOPE BRIEF
Hey! We need a complete brand identity revamp including logo, typography guidelines, design tokens, and 10 custom marketing landing pages built in Next.js.
Terms:
- Fixed budget of $1,200 for the entire package.
- Contractor shall provide unlimited rounds of revisions until the Client is completely satisfied with all creative assets.
- Deliverables must look modern, high-converting, and world-class. Specific animations and interactive widgets will be requested during design review.
- Contractor agrees to attend daily morning 45-minute standup calls and provide ongoing Slack support.
- All intellectual property transfers immediately upon contract signing before any payment milestone is processed.`,
  },
  {
    title: "Simple Storefront with Hidden Multi-Vendor Backend",
    clientName: "RapidCommerce Inc.",
    budgetAmount: 2000,
    hourlyMinimum: 55,
    currency: "USD",
    tone: "ENGLISH" as const,
    rawContent: `PROJECT SPECIFICATION & CHAT LOG - RAPIDCOMMERCE
Client: We just need a simple clean storefront for our boutique catalog. Very standard build!
Deliverables:
- Contractor will build a clean storefront as described.
- Scope of deliverables will include standard e-commerce features as determined by client during weekly syncs.
- In addition to standard catalog display, Contractor shall integrate multi-vendor marketplace split payouts, real-time inventory synchronization webhooks, and custom Stripe Connect flows.
- Contractor shall also implement mobile app API endpoints and native push notification handlers as part of standard delivery.
- All modifications requested in Slack shall be implemented within 24 hours at no extra charge.
- No deadline-change terms or timeline adjustments will be granted for any scope expansions requested during the build.
- Exclusions: None. Contractor is responsible for all server configurations, DevOps deployments, and database optimizations required to go live.`,
  },
];

export async function runSeed() {
  console.log("🌱 [Seed] Starting Jhanjhat demo deals seeding...");

  for (const deal of DEMO_DEALS) {
    console.log(`\n======================================================`);
    console.log(`📌 Processing Deal: "${deal.title}" for ${deal.clientName}`);

    // Check if project exists or create it
    let project = await prisma.project.findFirst({
      where: { title: deal.title },
      include: { documents: true },
    });

    if (!project) {
      project = await projectRepository.createProject(deal);
      console.log(`✅ Created Project: ${project.id}`);
    } else {
      console.log(`ℹ️ Project exists: ${project.id}`);
    }

    const document = project.documents[0];
    if (!document) {
      throw new Error(`Document missing for project ${project.id}`);
    }

    // Run deal analysis
    console.log(`🧠 Running deal analysis with quote verification and plain TS maths...`);
    const analysisResult = await analyzeDeal({
      projectId: project.id,
      documentId: document.id,
      rawContent: deal.rawContent,
      budgetAmount: deal.budgetAmount,
      hourlyMinimum: deal.hourlyMinimum,
      clientName: deal.clientName,
      projectTitle: deal.title,
      tone: deal.tone,
    });

    console.log(`   - Risk Score: ${analysisResult.riskScore}/100`);
    console.log(`   - Decision: ${analysisResult.decision}`);
    console.log(`   - Verified Clauses: ${analysisResult.riskyClauses.length} (Dropped: ${analysisResult.droppedQuotesCount})`);
    console.log(`   - Effective Hourly Rate: $${analysisResult.math.effectiveHourlyRate}/hr (vs min $${deal.hourlyMinimum}/hr)`);
    console.log(`   - Suggested Counter Offer: $${analysisResult.math.suggestedCounterOfferAmount}`);

    // Update project estimated hours from likely hours
    await projectRepository.updateEstimatedHours(project.id, analysisResult.math.totalEffectiveHours);

    // Save analysis to DB
    const savedAnalysis = await analysisRepository.saveAnalysis({
      projectId: project.id,
      documentId: document.id,
      riskScore: analysisResult.riskScore,
      effectiveHourlyRate: analysisResult.math.effectiveHourlyRate,
      decision: analysisResult.decision,
      counterOffer: analysisResult.counterOffer,
      draftReply: analysisResult.draftReply,
      tone: analysisResult.tone,
      droppedQuotesCount: analysisResult.droppedQuotesCount,
      hiddenCosts: analysisResult.hiddenCosts,
      rawResponse: analysisResult,
      clauses: analysisResult.riskyClauses,
      workItems: analysisResult.workItems,
    });
    console.log(`💾 Saved Analysis: ${savedAnalysis.id}`);

    // Embed and store in Deal Memory (batched call)
    console.log(`🗄️ Indexing into Deal Memory (HNSW vector + GIN tsvector)...`);
    // Delete older chunks for this project to keep clean
    await chunkRepository.deleteChunksByProject(project.id);
    const chunkIds = await embedAndStoreDealMemory({
      projectId: project.id,
      documentId: document.id,
      analysis: analysisResult,
      clauses: analysisResult.riskyClauses,
    });
    console.log(`⚡ Indexed ${chunkIds.length} chunks into Deal Memory`);
  }

  // Smoke test hybrid search
  console.log(`\n======================================================`);
  console.log(`🔍 [Smoke Test] Running Hybrid Search (70% Vector + 30% Full-Text)...`);
  const query = "payment released after launch 10000 users";
  const matches = await findSimilarPastDeals(query);
  console.log(`🎯 Top matches for "${query}":`);
  matches.forEach((m: any, idx: number) => {
    console.log(
      `   [${idx + 1}] Deal: "${m.projectTitle}" | Client: ${m.clientName} | Hybrid Score: ${(m.hybridScore * 100).toFixed(1)}% (Vec: ${(m.vectorScore * 100).toFixed(1)}%, Text: ${(m.keywordScore * 100).toFixed(1)}%)`
    );
    console.log(`       Preview: ${m.content.slice(0, 100)}...`);
  });

  console.log(`\n🎉 [Seed] Seeding and smoke test completed successfully!`);
}

if (require.main === module) {
  runSeed()
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
