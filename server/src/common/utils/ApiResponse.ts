import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data?: T,
    message = 'Success',
    statusCode = 200,
    pagination?: PaginationMeta
  ) {
    const payload: any = {
      success: true,
      message,
      data
    };

    if (pagination) {
      payload.pagination = pagination;
    }

    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message = 'Internal Server Error',
    statusCode = 500,
    errors?: Array<{ field?: string; message: string }>
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && errors.length > 0 ? { errors } : {})
    });
  }
}
