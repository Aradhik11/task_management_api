import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  error: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let status = error.status || error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errors: string[] = [];

  // Handle Sequelize validation errors
  if (error instanceof ValidationError) {
    status = 400;
    message = 'Validation Error';
    errors = error.errors.map(err => err.message);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  res.status(status).json({
    message,
    errors: errors.length > 0 ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};