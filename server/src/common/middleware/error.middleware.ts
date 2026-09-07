import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../../config/env';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors;

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
    errors = [{ field: err.path, message: `Invalid identifier format: ${err.value}` }];
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${val}' already exists.`;
    errors = [{ field, message }];
  }

  // Handle Mongoose Schema Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Database validation failed';
    errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message
    }));
  }

  // Handle JSON parsing syntax error
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    statusCode = 400;
    message = 'Malformed JSON in request payload';
  }

  if (statusCode >= 500 && env.NODE_ENV === 'development') {
    console.error('[Unhandled Exception]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
    ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {})
  });
};
