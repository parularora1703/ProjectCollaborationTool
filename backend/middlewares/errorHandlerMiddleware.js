// backend/middlewares/errorHandlerMiddleware.js
import { HTTPSTATUS } from "../config/http.config.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error Occurred on PATH:", req.path, err);

  const statusCode = err.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    message:
      statusCode === HTTPSTATUS.INTERNAL_SERVER_ERROR
        ? "Internal Server Error"
        : err.message,
    error: err.message,
    errorCode: err.errorCode || null,
  });
};
