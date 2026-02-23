/**
 * Express re-exports
 *
 * This module re-exports Express types and utilities for use across the framework
 * and in examples to ensure version consistency.
 */

export {
  default as express,
  type Application,
  type Router,
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
  type ErrorRequestHandler,
} from 'express';
