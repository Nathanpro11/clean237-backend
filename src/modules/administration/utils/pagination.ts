type QueryValue = string | string[] | number | boolean | undefined | null;

export type PaginationOptions = {
  page: number;
  limit: number;
  skip: number;
  sortField: string;
  sortOrder: 1 | -1;
  sortOptions: Record<string, 1 | -1>;
};

export const parsePaginationAndSort = (
  query: Record<string, QueryValue> = {},
  allowedSortFields: string[] = ["createdAt", "updatedAt"],
  defaultSortField = "createdAt"
): PaginationOptions => {
  const rawPage = Number(query.page ?? 1);
  const rawLimit = Number(query.limit ?? 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 10;

  const sortValue = typeof query.sort === "string" ? query.sort : defaultSortField;
  const sortField = allowedSortFields.includes(sortValue) ? sortValue : defaultSortField;
  const sortOrder = typeof query.order === "string" && query.order.toLowerCase() === "asc" ? 1 : -1;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortField,
    sortOrder,
    sortOptions: { [sortField]: sortOrder },
  };
};
