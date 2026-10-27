import { randomUUID } from "node:crypto";
import { prisma } from "../client";

export interface StoreChunkInput {
  id?: string;
  projectId: string;
  documentId?: string | null;
  clauseId?: string | null;
  content: string;
  metadata?: Record<string, any>;
  embedding: number[];
  embeddingModel?: string;
}

export interface HybridSearchInput {
  queryText: string;
  queryEmbedding: number[];
  excludeProjectId?: string;
  limit?: number;
  vectorWeight?: number; // default 0.70
  keywordWeight?: number; // default 0.30
  embeddingModel?: string;
}

export interface SimilarDealResult {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  documentId: string | null;
  clauseId: string | null;
  content: string;
  metadata: any;
  embeddingModel: string;
  vectorScore: number;
  keywordScore: number;
  hybridScore: number;
  createdAt: Date;
}

export class ChunkRepository {
  /**
   * Stores a chunk with vector(1024) embedding and searchVector tsvector using raw SQL.
   */
  async storeChunk(input: StoreChunkInput): Promise<string> {
    const id = input.id || randomUUID();
    const vectorStr = `[${input.embedding.join(",")}]`;
    const metadataJson = JSON.stringify(input.metadata || {});
    const model = input.embeddingModel || process.env.EMBED_MODEL || "openai/text-embedding-3-small";

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Chunk" (
        "id", "projectId", "documentId", "clauseId", "content", "metadata", "embeddingModel", "embedding", "searchVector", "createdAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6::jsonb, $7, $8::vector, to_tsvector('english', $5), NOW()
      )`,
      id,
      input.projectId,
      input.documentId ?? null,
      input.clauseId ?? null,
      input.content,
      metadataJson,
      model,
      vectorStr
    );

    return id;
  }

  /**
   * Batched store of multiple chunks.
   */
  async storeChunks(inputs: StoreChunkInput[]): Promise<string[]> {
    const ids: string[] = [];
    for (const input of inputs) {
      const id = await this.storeChunk(input);
      ids.push(id);
    }
    return ids;
  }

  /**
   * Hybrid Search: 70% vector cosine similarity + 30% postgres full-text ts_rank.
   * Joins with Project to provide rich deal context for Deal Memory.
   */
  async hybridSearch(input: HybridSearchInput): Promise<SimilarDealResult[]> {
    const limit = input.limit ?? 5;
    const vectorWeight = input.vectorWeight ?? 0.70;
    const keywordWeight = input.keywordWeight ?? 0.30;
    const currentModel = input.embeddingModel || process.env.EMBED_MODEL || "openai/text-embedding-3-small";
    const vectorStr = `[${input.queryEmbedding.join(",")}]`;

    const conditions: string[] = [`c."embeddingModel" = $1`];
    const params: any[] = [currentModel, vectorStr, input.queryText, vectorWeight, keywordWeight, limit];

    if (input.excludeProjectId) {
      params.push(input.excludeProjectId);
      conditions.push(`c."projectId" != $${params.length}`);
    }

    const whereClause = conditions.join(" AND ");

    const query = `
      WITH scored_chunks AS (
        SELECT 
          c."id",
          c."projectId",
          p."title" AS "projectTitle",
          p."clientName" AS "clientName",
          c."documentId",
          c."clauseId",
          c."content",
          c."metadata",
          c."embeddingModel",
          c."createdAt",
          -- Cosine similarity: 1 - cosine distance bounded [0, 1]
          GREATEST(0.0, 1.0 - (c."embedding" <=> $2::vector)) AS vector_score,
          -- Text rank score
          COALESCE(ts_rank_cd(to_tsvector('english', c."content"), plainto_tsquery('english', $3)), 0.0) AS keyword_score
        FROM "Chunk" c
        JOIN "Project" p ON c."projectId" = p."id"
        WHERE ${whereClause}
      )
      SELECT 
        id,
        "projectId",
        "projectTitle",
        "clientName",
        "documentId",
        "clauseId",
        content,
        metadata,
        "embeddingModel",
        "createdAt",
        CAST(vector_score AS float) AS "vectorScore",
        CAST(keyword_score AS float) AS "keywordScore",
        CAST(($4 * vector_score + $5 * keyword_score) AS float) AS "hybridScore"
      FROM scored_chunks
      ORDER BY ($4 * vector_score + $5 * keyword_score) DESC
      LIMIT $6;
    `;

    const results = await prisma.$queryRawUnsafe<SimilarDealResult[]>(query, ...params);
    return results;
  }

  async deleteChunksByProject(projectId: string): Promise<void> {
    await prisma.$executeRawUnsafe(`DELETE FROM "Chunk" WHERE "projectId" = $1`, projectId);
  }
}

export const chunkRepository = new ChunkRepository();
