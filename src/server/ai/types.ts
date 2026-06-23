import { z } from "zod";

export const futureAiSuggestionSchema = z.object({
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  missingFields: z.array(z.string()),
  suggestedNextAction: z.string(),
});

export type FutureAiSuggestion = z.infer<typeof futureAiSuggestionSchema>;

export type AiProviderMode = "vercel-ai-sdk" | "openai-structured-outputs";
