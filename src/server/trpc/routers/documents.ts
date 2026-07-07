import { z } from "zod";
import { DocumentGenerationStatus, DocumentType } from "@prisma/client";
import { serializeDownloadableFilesForCrm } from "@/server/documents/serializers";
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
      const jobs = await ctx.prisma.documentGenerationJob.findMany({
        where: {
          organizationId: input.organizationId,
          status: input.status,
        },
        include: {
          generatedDocument: {
            select: {
              createdAt: true,
              docxFileKey: true,
              id: true,
              organizationId: true,
              pdfFileKey: true,
              status: true,
              templateVersion: true,
              type: true,
              updatedAt: true,
              zipFileKey: true,
              template: {
                select: {
                  name: true,
                },
              },
            },
          },
          template: {
            select: {
              id: true,
              name: true,
              status: true,
              type: true,
              version: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return jobs.map((job) => ({
        ...job,
        generatedDocument: job.generatedDocument
          ? {
              createdAt: job.generatedDocument.createdAt,
              files: serializeDownloadableFilesForCrm(job.generatedDocument),
              id: job.generatedDocument.id,
              organizationId: job.generatedDocument.organizationId,
              status: job.generatedDocument.status,
              templateVersion: job.generatedDocument.templateVersion,
              type: job.generatedDocument.type,
              updatedAt: job.generatedDocument.updatedAt,
            }
          : null,
      }));
    }),

  activeTemplates: protectedProcedure
    .input(z.object({ type: z.nativeEnum(DocumentType).optional() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.documentTemplate.findMany({
        where: {
          type: input.type,
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          status: true,
          type: true,
          variablesSchema: true,
          version: true,
        },
        orderBy: [{ type: "asc" }, { version: "desc" }],
      });
    }),
});
