import express from "express";
import { createServer } from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import mime from "mime";
import { createBareServer } from "@nebula-services/bare-server-node";
import chalk from "chalk";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

const app = express();
const bareServer = createBareServer("/bare/");
const server = createServer();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(join(__dirname, "static")));

// Serve all static pages
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "static", "index.html"));
});

server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(chalk.hex("#a78bfa")(`
  ░█▀█░█▀▄░█▀▄░▀█▀░▀█▀
  ░█░█░█▀▄░█▀▄░░█░░░█░
  ░▀▀▀░▀░▀░▀▀░░▀▀▀░░▀░

  `));
  console.log(chalk.white(`  🌑 Orbit is live on `) + chalk.hex("#a78bfa")(`http://localhost:${PORT}`));
  console.log(chalk.gray(`  Press Ctrl+C to stop.\n`));
});
