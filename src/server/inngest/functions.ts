import { inngest } from "@/server/inngest/client";
import { generateDocumentFromJob } from "@/server/documents/service";

export const generateDocument = inngest.createFunction(
  {
    id: "generate-document",
    name: "Generate document",
    retries: 3,
  },
  { event: "document/generate.requested" },
  async ({ event, step }) => {
    const jobId = event.data.jobId as string;

    return step.run("render-docx-and-update-records", async () => {
      const document = await generateDocumentFromJob(jobId);

      return {
        generatedDocumentId: document.id,
        status: document.status,
      };
    });
  },
);

export const inngestFunctions = [generateDocument];
