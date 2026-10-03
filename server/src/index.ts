import { createApp } from "./app.js";
import { config } from "./config.js";
import { db } from "./db/index.js";
import { engineStatus } from "./lib/engine.js";

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Sach-AI API listening on http://localhost:${config.port}`);
  console.log(`SQLite database: ${config.databasePath}`);
  engineStatus().then((status) => {
    console.log(
      `Detection engine: ${status.primary}` +
        (status.model.available
          ? ` (${status.model.weights?.map((w) => w.file).join(", ") ?? "no weights found"})`
          : " - inference service offline, scans will use the local simulator"),
    );
  });
});

const shutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
