import express from "express";
import DefaultController from "../controller/default.controller";

const router = express.Router();

const defaultController = new DefaultController();

router.get("/", defaultController.getRoute);
router.post("/health", defaultController.postRoute);

export default router;
