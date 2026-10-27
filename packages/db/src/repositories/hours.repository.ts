import { prisma } from "../client";

export class HoursRepository {
  async logHours(params: {
    projectId: string;
    hours: number;
    description: string;
    date?: Date;
  }) {
    const { projectId, hours, description, date } = params;

    const log = await prisma.hoursLog.create({
      data: {
        projectId,
        hours,
        description,
        date: date || new Date(),
      },
    });

    // Check project and calculate alert conditions
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        hoursLogs: true,
      },
    });

    if (project) {
      const totalLoggedHours = project.hoursLogs.reduce((sum, item) => sum + item.hours, 0);
      const estHours = project.estimatedHours > 0 ? project.estimatedHours : 40; // Default estimate baseline
      const percentage = (totalLoggedHours / estHours) * 100;

      // 1. Threshold alerts: 70%, 90%, 100%
      if (percentage >= 100) {
        await this.ensureAlert(
          projectId,
          "HOURS_100",
          `⚠️ Budget ceiling reached: You have logged ${totalLoggedHours}h (${Math.round(percentage)}% of ${estHours}h estimate). Further hours erode your profit!`
        );
      } else if (percentage >= 90) {
        await this.ensureAlert(
          projectId,
          "HOURS_90",
          `⚠️ High alert: ${totalLoggedHours}h logged (${Math.round(percentage)}% of ${estHours}h estimate). Wrap up deliverables or renegotiate.`
        );
      } else if (percentage >= 70) {
        await this.ensureAlert(
          projectId,
          "HOURS_70",
          `Notice: ${totalLoggedHours}h logged (${Math.round(percentage)}% of ${estHours}h estimate). Scope is consuming budget rapidly.`
        );
      }

      // 2. Effective hourly rate alert
      if (totalLoggedHours > 0 && project.budgetAmount > 0) {
        const currentEffectiveRate = project.budgetAmount / totalLoggedHours;
        if (currentEffectiveRate < project.hourlyMinimum) {
          await this.ensureAlert(
            projectId,
            "RATE_BELOW_MIN",
            `🚨 Rate below minimum: Effective hourly rate is now $${Math.round(currentEffectiveRate)}/h, dropping below your minimum of $${project.hourlyMinimum}/h.`
          );
        }
      }
    }

    return log;
  }

  private async ensureAlert(projectId: string, type: string, message: string) {
    const existing = await prisma.alert.findFirst({
      where: {
        projectId,
        type,
        isDismissed: false,
      },
    });

    if (!existing) {
      await prisma.alert.create({
        data: {
          projectId,
          type,
          message,
        },
      });
    }
  }

  async getProjectHoursSummary(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        hoursLogs: { orderBy: { date: "desc" } },
        alerts: { where: { isDismissed: false }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!project) return null;

    const totalLoggedHours = project.hoursLogs.reduce((sum, item) => sum + item.hours, 0);
    const estHours = project.estimatedHours > 0 ? project.estimatedHours : 40;
    const percentage = Math.round((totalLoggedHours / estHours) * 100);
    const effectiveHourlyRate = totalLoggedHours > 0 ? Math.round((project.budgetAmount / totalLoggedHours) * 100) / 100 : project.budgetAmount;

    return {
      totalLoggedHours,
      estimatedHours: estHours,
      percentage,
      budgetAmount: project.budgetAmount,
      hourlyMinimum: project.hourlyMinimum,
      effectiveHourlyRate,
      isBelowMinimum: effectiveHourlyRate < project.hourlyMinimum,
      hoursLogs: project.hoursLogs,
      alerts: project.alerts,
    };
  }

  async dismissAlert(alertId: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: { isDismissed: true },
    });
  }
}

export const hoursRepository = new HoursRepository();
