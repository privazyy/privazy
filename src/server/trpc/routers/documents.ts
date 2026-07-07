import { z } from "zod";
import { DocumentGenerationStatus, DocumentType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { isStaffReader, resolveDocumentListOrganizationScope } from "@/server/auth/organization-access";
import {
  serializeDocumentJobForClient,
  serializeDocumentJobForCrm,
  serializeDocumentTemplateForClient,
  serializeDocumentTemplateForCrm,
} from "@/server/documents/serializers";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";

const documentListInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  organizationId: z.string().min(1).optional(),
  status: z.nativeEnum(DocumentGenerationStatus).optional(),
});

const activeTemplatesInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  type: z.nativeEnum(DocumentType).optional(),
});

export const documentsRouter = createTRPCRouter({
  listJobs: protectedProcedure
    .input(documentListInputSchema)
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const organizationScope = await resolveDocumentListOrganizationScope(
        ctx.prisma,
        user,
        input.organizationId,
      );

      const jobs = await ctx.prisma.documentGenerationJob.findMany({
        where: {
          ...organizationScope,
          status: input.status,
        },
        select: {
          completedAt: true,
          createdAt: true,
          errorMessage: true,
          generatedDocument: {
            select: {
              createdAt: true,
              id: true,
              organizationId: true,
              status: true,
              templateId: true,
              templateVersion: true,
              type: true,
            },
          },
          id: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          organizationId: true,
          status: true,
          template: {
            select: {
              id: true,
              name: true,
              status: true,
              type: true,
              version: true,
            },
          },
          templateId: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return isStaffReader(user.role)
        ? jobs.map(serializeDocumentJobForCrm)
        : jobs.map(serializeDocumentJobForClient);
    }),

  activeTemplates: protectedProcedure
    .input(activeTemplatesInputSchema)
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;

      if (!isStaffReader(user.role) && user.role !== "CLIENT") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Document template access requires an authorized role.",
        });
      }

      const templates = await ctx.prisma.documentTemplate.findMany({
        where: {
          type: input.type,
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          status: true,
          type: true,
          version: true,
        },
        orderBy: [{ type: "asc" }, { version: "desc" }],
        take: input.limit,
      });

      return isStaffReader(user.role)
        ? templates.map(serializeDocumentTemplateForCrm)
        : templates.map(serializeDocumentTemplateForClient);
    }),
});
