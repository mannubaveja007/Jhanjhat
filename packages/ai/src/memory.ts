import { chunkRepository, StoreChunkInput } from "@jhanjhat/db";
import { RiskyClause, DealAnalysisResult, redactSensitiveInfo } from "@jhanjhat/shared";
import { embeddingsClient } from "./embeddings";

export interface IndexDealParams {
  projectId: string;
  documentId: string;
  analysis: DealAnalysisResult;
  clauses: RiskyClause[];
}

export async function embedAndStoreDealMemory(params: IndexDealParams): Promise<string[]> {
  const { projectId, documentId, analysis, clauses } = params;

  const chunksToEmbed: Array<{ content: string; metadata: Record<string, any>; clauseId?: string }> = [];

  // 1. Overall Deal Summary Chunk
  const summaryText = `Project Deal: Risk score ${analysis.riskScore}/100. Decision: ${analysis.decision}. Counter offer: ${analysis.counterOffer}. Effective rate: $${analysis.math.effectiveHourlyRate}/hr vs min $${analysis.math.hourlyMinimum}/hr.`;
  chunksToEmbed.push({
    content: summaryText,
    metadata: {
      type: "DEAL_SUMMARY",
      riskScore: analysis.riskScore,
      decision: analysis.decision,
    },
  });

  // 2. Clause Chunks
  for (const clause of clauses) {
    const clauseText = `Clause [${clause.category}]: "${clause.quote}". Risk analysis: ${clause.explanation} (${clause.severity} severity).`;
    chunksToEmbed.push({
      content: clauseText,
      metadata: {
        type: "CLAUSE",
        category: clause.category,
        severity: clause.severity,
        quote: clause.quote,
      },
    });
  }

  if (chunksToEmbed.length === 0) return [];

  // Redact all text before sending to embedding provider (OpenRouter)
  const redactedTexts = chunksToEmbed.map((c) => redactSensitiveInfo(c.content).redactedText);

  // One batched request per document as required
  console.log(`[Deal Memory] Embedding ${redactedTexts.length} chunks in one batched request for project ${projectId}`);
  const embeddings = await embeddingsClient.embedBatch(redactedTexts);

  // Store in Chunk table with vector(1024)
  const storeInputs: StoreChunkInput[] = chunksToEmbed.map((c, i) => ({
    projectId,
    documentId,
    content: c.content,
    metadata: c.metadata,
    embedding: embeddings[i],
    embeddingModel: embeddingsClient.getModel(),
  }));

  const ids = await chunkRepository.storeChunks(storeInputs);
  return ids;
}

export async function findSimilarPastDeals(queryText: string, currentProjectId?: string) {
  const redactedQuery = redactSensitiveInfo(queryText).redactedText;
  const queryEmbedding = await embeddingsClient.embed(redactedQuery);

  const results = await chunkRepository.hybridSearch({
    queryText: redactedQuery,
    queryEmbedding,
    excludeProjectId: currentProjectId,
    limit: 5,
    vectorWeight: 0.7,
    keywordWeight: 0.3,
    embeddingModel: embeddingsClient.getModel(),
  });

  return results;
}
