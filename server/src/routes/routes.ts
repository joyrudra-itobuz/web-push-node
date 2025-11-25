import express from "express";
import NotificationController from "../controller/notification.controller";

const router = express.Router();

const notificationController = new NotificationController();

router.get("/", notificationController.trigger);
router.post("/", notificationController.subscribe);

export default router;
