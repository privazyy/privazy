import { createTRPCRouter } from "@/server/trpc/init";
import { documentsRouter } from "@/server/trpc/routers/documents";

export const appRouter = createTRPCRouter({
  documents: documentsRouter,
});

export type AppRouter = typeof appRouter;
