import { z } from "zod";
import { DocumentGenerationStatus, DocumentType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ForbiddenError, UnauthorizedError, assertCanAccessOrganization, requireRole } from "@/server/auth/guards";
import { DOCUMENT_READ_ROLES } from "@/server/auth/roles";
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
      const user = await requireDocumentReadUser();

      if (user.role === "CLIENT") {
        if (!input.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Client users must scope document jobs to an organization." });
        }

        await assertOrganizationForTrpc(user, input.organizationId);
      }

      return ctx.prisma.documentGenerationJob.findMany({
        where: {
          organizationId: input.organizationId,
          status: input.status,
        },
        include: {
          generatedDocument: true,
          template: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }),

  activeTemplates: protectedProcedure
    .input(z.object({ type: z.nativeEnum(DocumentType).optional() }))
    .query(async ({ ctx, input }) => {
      await requireDocumentReadUser();

      return ctx.prisma.documentTemplate.findMany({
        where: {
          status: "ACTIVE",
          type: input.type,
        },
        orderBy: [{ type: "asc" }, { version: "desc" }],
      });
    }),
});

async function requireDocumentReadUser() {
  try {
    return await requireRole(DOCUMENT_READ_ROLES);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (error instanceof ForbiddenError) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    throw error;
  }
}

async function assertOrganizationForTrpc(user: Awaited<ReturnType<typeof requireDocumentReadUser>>, organizationId: string) {
  try {
    await assertCanAccessOrganization(user, organizationId);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    throw error;
  }
}
