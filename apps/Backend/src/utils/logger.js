const winston = require("winston");

/**
 * Structured logs for gateway ↔ AI traffic and server diagnostics.
 * JSON in production-friendly form; readable in development.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "heart-backend" },
  transports: [new winston.transports.Console()],
});

module.exports = { logger };
