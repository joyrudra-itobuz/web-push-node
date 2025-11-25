import express from "express";
import cors from "cors";
import router from "../routes/routes";
import errorHandler from "../middleware/error.handler.middleware";
import loggerMiddleware from "../middleware/logger.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
function startServer() {
  app.use(cors());
  app.use(express.json());
  app.use(loggerMiddleware);

  app.use("/notification", router);

  // Sample route
  app.get("/", (req, res) => {
    res.send({
      message: "Server is up and running!",
      success: true,
      timestamp: new Date().toISOString(),
    });
  });

  app.use(errorHandler);

  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default startServer;
