import { crmApiData, crmApiMethodNotAllowed, withCrmApiMutation, withCrmApiRead } from "@/server/crm/api-guard";
import { crmLeadListQuerySchema, getCrmLeadsForStaff } from "@/server/crm/leads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withCrmApiRead(async (request) => {
  const url = new URL(request.url);
  const query = crmLeadListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const data = await getCrmLeadsForStaff(query);

  return crmApiData(data);
});

const mutationNotImplemented = withCrmApiMutation(async () =>
  crmApiMethodNotAllowed("Mutacje leadow CRM beda dodane w osobnym PR."),
);

export const POST = mutationNotImplemented;
export const PATCH = mutationNotImplemented;
export const PUT = mutationNotImplemented;
export const DELETE = mutationNotImplemented;
