import { DocumentGenerationStatus, DocumentType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { actorFromSession, isStaffActor } from "@/server/auth/permissions";
import { serializeDocumentJobForClient } from "@/server/documents/serializers";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";

export const documentsRouter = createTRPCRouter({
  listJobs: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        status: z.nativeEnum(DocumentGenerationStatus).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const actor = actorFromSession(ctx.session);
      if (!actor) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const isStaff = isStaffActor(actor);
      const clientOrganizationIds = isStaff ? [] : await listClientOrganizationIds(ctx.prisma, actor.id);

      if (!isStaff && input.organizationId && !clientOrganizationIds.includes(input.organizationId)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const jobs = await ctx.prisma.documentGenerationJob.findMany({
        where: {
          organizationId: isStaff ? input.organizationId : { in: clientOrganizationIds },
          status: input.status,
        },
        include: {
          generatedDocument: true,
          template: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return jobs.map(serializeDocumentJobForClient);
    }),

  activeTemplates: protectedProcedure
    .input(z.object({ type: z.nativeEnum(DocumentType).optional() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.documentTemplate.findMany({
        where: {
          type: input.type,
          status: "ACTIVE",
        },
        orderBy: [{ type: "asc" }, { version: "desc" }],
      });
    }),
});

async function listClientOrganizationIds(
  prisma: {
    clientProfile: {
      findMany(input: { select: { organizationId: true }; where: { userId: string } }): Promise<Array<{ organizationId: string }>>;
    };
  },
  userId: string,
) {
  const memberships = await prisma.clientProfile.findMany({
    select: { organizationId: true },
    where: { userId },
  });

  return memberships.map((membership) => membership.organizationId);
}
