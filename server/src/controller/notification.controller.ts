import type { Request, RequestHandler } from "express";
import {
  saveSubscription,
  sendNotification,
} from "../service/notification.service";

function resolveUserId(req: Request) {
  const queryValue = req.query?.userId;
  if (typeof queryValue === "string" && queryValue.length) {
    return queryValue;
  }

  const headerId = req.headers?.["x-user-id"];
  if (typeof headerId === "string" && headerId.length) {
    return headerId;
  }
  if (Array.isArray(headerId) && headerId[0]) {
    return headerId[0];
  }
  return undefined;
}

export default class NotificationController {
  public subscribe: RequestHandler = async (req, res, next) => {
    try {
      const body = req.body ?? {};
      const subscription = body.subscription ?? body;
      const userId = body.userId ?? body.user?.id ?? null;

      if (!subscription?.endpoint) {
        return res.status(400).send({
          message: "Invalid subscription payload",
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      const record = await saveSubscription(subscription, userId);

      res.send({
        message: "Subscription saved",
        success: true,
        timestamp: new Date().toISOString(),
        record,
      });
    } catch (error) {
      next(error);
    }
  };

  public trigger: RequestHandler = async (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const result = await sendNotification({ userId });

      res.send({
        message: "Notification dispatched",
        success: true,
        timestamp: new Date().toISOString(),
        userId: userId ?? null,
        notification: result.notification,
        targetCount: result.targetCount,
        results: result.results,
      });
    } catch (error) {
      const err = error as Error;
      if (/No subscriptions/i.test(err.message)) {
        return res.status(404).send({
          message: err.message,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
}
