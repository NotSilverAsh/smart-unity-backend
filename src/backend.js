// REQUIRED DEPENDENCY //
import express from "express";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import cors from "cors";
config();

// OPTIONAL DEPENDENCY //
import chalk from "chalk";

// VARIABLES //
const app = express();
const PORT = process.env.PORT || 8000;
const ERR = JSON.parse(fs.readFileSync(path.resolve("./src/api/v1/config/ErrorType.json"), "utf-8"));

// EXPRESS CONFIGURATION //
app.use(cors()); // Enables Cross-Origin

/**
 * ROUTERS ENDPOINT
 */
import weatherObserveRouter from "./api/v1/weather/weatherObserve.js";
import searchUtilRouter from "./api/v1/utils/search.js";

// DEFINE ENDPOINTS TO EACH ROUTERS //
app.use('/api/v1/weather', weatherObserveRouter);
app.use('/api/v1/utils/search', searchUtilRouter);

// Monitor //
app.use((req, res) => {
  res.sendStatus(200)
});

// RETURN 404 TO NON-EXISTENT ROUTES //
app.use((req, res) => {
  const { HTTP_ERR_CODE, ERR_MESSAGE } = ERR.NON_EXISTENT_ENDPOINT;
  res.status(HTTP_ERR_CODE).json({ "HTTP_ERR_CODE": HTTP_ERR_CODE, "ERR_MESSAGE": ERR_MESSAGE });
  console.log(chalk.red(`[-] BACKEND SERVER: The Route Endpoint: ${req.originalUrl} Does Not Exists.`))
});

// Start Express Server //
app.listen(PORT, (req) => {
  try {
    console.clear();
    console.log(chalk.green(`[+] Server is running on port: http://localhost:${PORT}/`));
  } catch (error) {
    console.log(chalk.red(`[-] Error starting server: ${error}`));
  }
});
