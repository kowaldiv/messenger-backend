class AppError extends Error {
  public code: string;
  public statusCode: number;

  constructor(code: string, statusCode: number) {
    super(code);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(code: string) {
    super(code, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(code: string = "Resource not found") {
    super(code, 404);
  }
}

export class ConflictError extends AppError {
  constructor(code: string = "Resource already exists") {
    super(code, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: string = "Unauthorized") {
    super(code, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: string = "Forbidden") {
    super(code, 403);
  }
}
