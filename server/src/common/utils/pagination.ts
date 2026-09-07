import { env } from '../../config/env';
import { PaginationMeta } from './ApiResponse';

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (query: PaginationQuery): PaginationParams => {
  let page = parseInt(String(query.page), 10);
  let limit = parseInt(String(query.limit), 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = env.DEFAULT_PAGE_LIMIT;
  } else if (limit > env.MAX_PAGE_LIMIT) {
    limit = env.MAX_PAGE_LIMIT;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
