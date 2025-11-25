import type { Request, Response, NextFunction } from "express";

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack);

  res.status(500).send({
    message: "Internal Server Error",
    success: false,
    timestamp: new Date().toISOString(),
  });
}
