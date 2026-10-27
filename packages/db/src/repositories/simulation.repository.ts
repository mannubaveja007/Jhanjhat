import { prisma } from "../client";
import { Scorecard } from "@jhanjhat/shared";

export interface CreateSimulationInput {
  projectId: string;
  clientName: string;
  freelancerName: string;
  persona: string;
  difficulty: number;
  projectBrief: string;
  hiddenAsks: string[];
  budgetCeiling: number;
  elevenlabsConversationId?: string;
}

export class SimulationRepository {
  async createSimulation(input: CreateSimulationInput) {
    return prisma.simulation.create({
      data: {
        projectId: input.projectId,
        clientName: input.clientName,
        freelancerName: input.freelancerName,
        persona: input.persona,
        difficulty: input.difficulty,
        projectBrief: input.projectBrief,
        hiddenAsks: input.hiddenAsks,
        budgetCeiling: input.budgetCeiling,
        elevenlabsConversationId: input.elevenlabsConversationId,
        status: "ACTIVE",
      },
    });
  }

  async getSimulation(id: string) {
    return prisma.simulation.findUnique({
      where: { id },
      include: {
        turns: {
          orderBy: { turnIndex: "asc" },
        },
        scorecard: true,
        project: true,
      },
    });
  }

  async updateConversationId(id: string, elevenlabsConversationId: string) {
    return prisma.simulation.update({
      where: { id },
      data: { elevenlabsConversationId, status: "ACTIVE" },
    });
  }

  async addTurn(params: {
    simulationId: string;
    role: "user" | "client" | "agent";
    content: string;
    turnIndex: number;
  }) {
    return prisma.simulationTurn.create({
      data: {
        simulationId: params.simulationId,
        role: params.role,
        content: params.content,
        turnIndex: params.turnIndex,
      },
    });
  }

  async saveScorecard(simulationId: string, scorecard: Scorecard) {
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { status: "COMPLETED" },
    });

    return prisma.scorecard.upsert({
      where: { simulationId },
      create: {
        simulationId,
        overallScore: scorecard.overallScore,
        summary: scorecard.summary,
        freeConcessions: scorecard.freeConcessions,
        boundariesHeld: scorecard.boundariesHeld,
        rewrites: scorecard.rewrites,
      },
      update: {
        overallScore: scorecard.overallScore,
        summary: scorecard.summary,
        freeConcessions: scorecard.freeConcessions,
        boundariesHeld: scorecard.boundariesHeld,
        rewrites: scorecard.rewrites,
      },
    });
  }
}

export const simulationRepository = new SimulationRepository();
