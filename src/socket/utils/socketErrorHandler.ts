import { Socket } from "socket.io";
import { z } from "zod";
import { AppError } from "../../errors/index.js";

type ErrorResponse = {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
};

export const handleSocketError = (socket: Socket, error: unknown) => {
  console.error(error);

  let errorResponse: ErrorResponse = {
    message: "An unexpected error occurred",
  };

  if (error instanceof AppError) {
    errorResponse = {
      message: error.message || "Failed to process request",
      code: error.code || "UNKNOWN_ERROR",
      statusCode: error.statusCode || 500,
    };
  } else if (error instanceof z.ZodError) {
    errorResponse = {
      message: error.issues[0]?.message || "Validation failed",
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details: error.issues,
    };
  }

  socket.emit("error", errorResponse);
};