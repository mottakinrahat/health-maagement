import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = err?.message || "Something went wrong!";
  let errorSources: any[] = [];

  if (err instanceof ZodError) {
    statusCode = status.BAD_REQUEST;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    }));
  } else if (err?.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      statusCode = status.CONFLICT;
      message = `Duplicate entry for field: ${err.meta?.target || "unique field"}`;
    } else if (err.code === "P2025") {
      statusCode = status.NOT_FOUND;
      message = err.meta?.cause || "Record not found!";
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources: errorSources.length > 0 ? errorSources : undefined,
    error: process.env.NODE_ENV === "development" ? err?.stack || err : undefined,
  });
};