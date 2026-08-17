import { Request } from "express";

export interface PaginationOptions {
  skip: number;
  limit: number;
  page: number;
  sort: Record<string, 1 | -1>;
}

export const getPaginationParams = (req: Request): PaginationOptions => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const tri = (req.query.tri as string) || "createdAt";
  const ordre = req.query.ordre === "desc" ? -1 : 1;
  const sort: Record<string, 1 | -1> = { [tri]: ordre };

  return { skip, limit, page, sort };
};
