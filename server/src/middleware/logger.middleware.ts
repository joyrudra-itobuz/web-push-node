import type { Request, Response, NextFunction } from "express";

export default function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { body, headers, params, query, originalUrl, baseUrl, host } = req;

    console.log(":::::::::::::::::::::Incoming Request:::::::::::::::::::::");
    console.log({
      body,
      headers,
      params,
      query,
      originalUrl,
      baseUrl,
      host,
      time: new Date().toLocaleTimeString(),
    });
    console.log(":::::::::::::::::::::Request Ends:::::::::::::::::::::");

    next();
  } catch (error) {
    next(error);
  }
}
