import { prisma } from "../client";
import { CreateDealInput, DealAnalysisResult } from "@jhanjhat/shared";

export class ProjectRepository {
  async createProject(input: CreateDealInput) {
    return prisma.project.create({
      data: {
        title: input.title,
        clientName: input.clientName,
        budgetAmount: input.budgetAmount,
        estimatedHours: 0,
        hourlyMinimum: input.hourlyMinimum,
        currency: input.currency,
        documents: {
          create: {
            title: input.title,
            type: "CONTRACT",
            rawContent: input.rawContent,
          },
        },
      },
      include: {
        documents: true,
      },
    });
  }

  async getProject(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { createdAt: "asc" },
        },
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            clauses: true,
            workItems: true,
          },
        },
        hoursLogs: {
          orderBy: { date: "desc" },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
        },
        simulations: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            turns: { orderBy: { turnIndex: "asc" } },
            scorecard: true,
          },
        },
      },
    });
  }

  async listProjects() {
    return prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        hoursLogs: true,
        alerts: {
          where: { isDismissed: false },
        },
      },
    });
  }

  async updateEstimatedHours(id: string, estimatedHours: number) {
    return prisma.project.update({
      where: { id },
      data: { estimatedHours },
    });
  }
}

export const projectRepository = new ProjectRepository();
