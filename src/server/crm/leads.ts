import "server-only";

import { z } from "zod";

import { listIodCrmLeads } from "@/server/leads/iod";

export const crmLeadListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).max(500).default(1),
  q: z.string().trim().min(1).max(120).optional(),
  source: z.string().trim().min(1).max(80).optional(),
  status: z.string().trim().min(1).max(60).optional(),
});

export type CrmLeadListQuery = z.infer<typeof crmLeadListQuerySchema>;
export type SafeCrmLeadListItem = ReturnType<typeof serializeCrmLeadListItem>;

export async function getCrmLeadsForStaff(params: CrmLeadListQuery) {
  const leads = await listIodCrmLeads({
    limit: params.limit,
    page: params.page,
  });

  const filteredLeads = leads
    .map(serializeCrmLeadListItem)
    .filter((lead) => matchesTextFilter(lead, params.q))
    .filter((lead) => matchesOptionalFilter(lead.source, params.source))
    .filter((lead) => matchesOptionalFilter(lead.stage, params.status));

  return {
    count: filteredLeads.length,
    filters: {
      q: params.q ?? null,
      source: params.source ?? null,
      status: params.status ?? null,
    },
    leads: filteredLeads,
    limit: params.limit,
    page: params.page,
  };
}

export function serializeCrmLeadListItem(lead: Awaited<ReturnType<typeof listIodCrmLeads>>[number]) {
  return {
    id: lead.id,
    company: lead.company,
    industry: lead.industry,
    source: lead.source,
    resultLabel: lead.resultLabel,
    value: lead.value,
    stage: lead.stage,
    owner: lead.owner,
    lastActivity: lead.lastActivity,
    hot: lead.hot,
  };
}

function matchesTextFilter(lead: SafeCrmLeadListItem, query: string | undefined) {
  if (!query) return true;
  const normalizedQuery = normalize(query);

  return [lead.company, lead.industry, lead.source, lead.resultLabel, lead.stage, lead.owner]
    .map(normalize)
    .some((value) => value.includes(normalizedQuery));
}

function matchesOptionalFilter(value: string, filter: string | undefined) {
  if (!filter) return true;
  return normalize(value).includes(normalize(filter));
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
