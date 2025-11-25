#!/usr/bin/env bun
import { sendNotification } from "../service/notification.service";

function parseArgs() {
  const args = process.argv.slice(2);
  const options: { userId?: string } = {};

  for (const arg of args) {
    if (arg === "-h" || arg === "--help") {
      console.log(
        "Usage: bun src/scripts/send-notification.ts [--userId=<id>]"
      );
      process.exit(0);
    }
    if (arg.startsWith("--userId=")) {
      options.userId = arg.split("=")[1];
      continue;
    }
    if (!options.userId) {
      options.userId = arg;
    }
  }

  if (!options.userId && process.env.USER_ID) {
    options.userId = process.env.USER_ID;
  }

  return options;
}

async function main() {
  const { userId } = parseArgs();
  const result = await sendNotification({ userId });

  console.log(
    JSON.stringify(
      {
        message: "Notification dispatched",
        userId: userId ?? null,
        notification: result.notification,
        targetCount: result.targetCount,
        results: result.results,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Failed to send notification", error);
  process.exit(1);
});
