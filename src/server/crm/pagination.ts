import "server-only";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export type CrmPagination = {
  cursor?: string;
  limit: number;
};

export function parseCrmPagination(input: { cursor?: string; limit?: number | string | null }): CrmPagination {
  const parsedLimit = Number(input.limit ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.min(MAX_LIMIT, Math.trunc(parsedLimit)))
    : DEFAULT_LIMIT;

  return {
    cursor: input.cursor || undefined,
    limit,
  };
}

export function paginatedResult<T extends { id: string }, R>(
  rows: T[],
  limit: number,
  serialize: (item: T) => R,
) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: items.map(serialize),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}
