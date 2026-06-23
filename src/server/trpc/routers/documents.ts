import { z } from "zod";
import { DocumentGenerationStatus, DocumentType } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";

export const documentsRouter = createTRPCRouter({
  listJobs: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        status: z.nativeEnum(DocumentGenerationStatus).optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.documentGenerationJob.findMany({
        where: {
          organizationId: input.organizationId,
          status: input.status,
        },
        include: {
          template: true,
          generatedDocument: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
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
