import express, { type RequestHandler } from "express";

export default class DefaultController {
  public getRoute: RequestHandler = (req, res, next) => {
    try {
      res.send({
        message: "Notification Service is up and running!",
        success: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  public postRoute: RequestHandler = (req, res, next) => {
    try {
      const { body } = req;

      console.log("Health check payload:", body);

      res.send({
        message: "Received Request",
        success: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}
