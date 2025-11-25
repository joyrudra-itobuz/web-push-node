import startServer from "./server/server";

async function bootStrap() {
  startServer();
}

bootStrap()
  .then(() => {
    console.log("Application started successfully.");
  })
  .catch((error) => {
    console.error("Error starting application:", error);
  });
