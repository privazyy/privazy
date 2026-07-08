import { z } from "zod";
import { DocumentGenerationStatus, DocumentType } from "@prisma/client";
import {
  serializeDownloadableFilesForClient,
  serializeDownloadableFilesForCrm,
} from "@/server/documents/serializers";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";

const clientDownloadStatuses = new Set(["DELIVERED", "GENERATED"]);
const staffDownloadStatuses = new Set(["ARCHIVED", "DELIVERED", "GENERATED"]);

export const documentsRouter = createTRPCRouter({
  listJobs: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        status: z.nativeEnum(DocumentGenerationStatus).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const actor = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          role: true,
          clientProfiles: {
            select: {
              organizationId: true,
            },
          },
        },
      });

      if (!actor) return [];

      const isClient = actor.role === "CLIENT";
      const clientOrganizationIds = actor.clientProfiles.map((profile) => profile.organizationId);
      const scopedOrganizationIds =
        input.organizationId && clientOrganizationIds.includes(input.organizationId)
          ? [input.organizationId]
          : input.organizationId
            ? []
            : clientOrganizationIds;

      const jobs = await ctx.prisma.documentGenerationJob.findMany({
        where: {
          organizationId: isClient ? { in: scopedOrganizationIds } : input.organizationId,
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

      return jobs.map((job) => {
        const generatedDocument = job.generatedDocument;
        const canExposeDownloadAction = generatedDocument
          ? isClient
            ? clientDownloadStatuses.has(generatedDocument.status)
            : staffDownloadStatuses.has(generatedDocument.status)
          : false;

        return {
          ...job,
          generatedDocument: generatedDocument
            ? {
                createdAt: generatedDocument.createdAt,
                files: canExposeDownloadAction
                  ? isClient
                    ? serializeDownloadableFilesForClient(generatedDocument)
                    : serializeDownloadableFilesForCrm(generatedDocument)
                  : [],
                id: generatedDocument.id,
                organizationId: generatedDocument.organizationId,
                status: generatedDocument.status,
                templateVersion: generatedDocument.templateVersion,
                type: generatedDocument.type,
                updatedAt: generatedDocument.updatedAt,
              }
            : null,
        };
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
