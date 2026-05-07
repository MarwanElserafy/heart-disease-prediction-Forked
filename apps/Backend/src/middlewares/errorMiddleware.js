const { handlePrismaError } = require("./prismaErrors");

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ 
    success: false, 
    error: "Route not found",
    details: []
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error("Global Error Handler caught:", err);

  // If Prisma error was handled, don't send another response
  if (handlePrismaError(err, res)) return;

  // Generic server error fallback
  const statusCode = err.status || err.statusCode || 500;
  const errorMsg = statusCode === 500 ? "Internal Server Error" : err.message;

  res.status(statusCode).json({
    success: false,
    error: errorMsg,
    details: process.env.NODE_ENV === "development" ? [{ stack: err.stack }] : [],
  });
};

module.exports = { notFoundHandler, globalErrorHandler };
