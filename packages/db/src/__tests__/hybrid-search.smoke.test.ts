import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../client";
import { chunkRepository } from "../repositories/chunk.repository";
import { projectRepository } from "../repositories/project.repository";
import { embeddingsClient } from "@jhanjhat/ai";

describe("Deal Memory & Hybrid Search Smoke Test", () => {
  let testProjectId: string;

  beforeAll(async () => {
    const project = await projectRepository.createProject({
      title: "Test Hybrid Search Project",
      clientName: "Smoke Test Client",
      budgetAmount: 1000,
      hourlyMinimum: 50,
      currency: "USD",
      tone: "ENGLISH",
      rawContent: "Clause: Payment shall only be made after final launch and public release.",
    });
    testProjectId = project.id;
  });

  afterAll(async () => {
    if (testProjectId) {
      await chunkRepository.deleteChunksByProject(testProjectId);
      await prisma.project.delete({ where: { id: testProjectId } });
    }
    await prisma.$disconnect();
  });

  it("stores chunk with vector(1024) and tsvector and performs hybrid search", async () => {
    const text = "Payment strictly withheld until 30 days after public launch and mobile release.";
    const [embedding] = await embeddingsClient.embedBatch([text]);

    expect(embedding.length).toBe(1024);

    const chunkId = await chunkRepository.storeChunk({
      projectId: testProjectId,
      content: text,
      embedding,
      embeddingModel: embeddingsClient.getModel(),
      metadata: { category: "PAYMENT_AFTER_LAUNCH" },
    });

    expect(chunkId).toBeDefined();

    // Query with similar semantics and keywords
    const query = "payment withheld after launch";
    const [queryVec] = await embeddingsClient.embedBatch([query]);

    const results = await chunkRepository.hybridSearch({
      queryText: query,
      queryEmbedding: queryVec,
      limit: 3,
      vectorWeight: 0.7,
      keywordWeight: 0.3,
      embeddingModel: embeddingsClient.getModel(),
    });

    expect(results.length).toBeGreaterThan(0);
    const foundTestChunk = results.find((r) => r.projectId === testProjectId);
    expect(foundTestChunk).toBeDefined();
    expect(results[0].hybridScore).toBeGreaterThan(0);
    expect(results[0].vectorScore).toBeGreaterThan(0);
  });
});
