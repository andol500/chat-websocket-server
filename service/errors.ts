import { Response } from "express";
import { ZodError } from "zod";

export interface HttpError {
  status: HttpStatus;
  message: ErrorMessages;
}
export enum ErrorMessages {
  INVALID_BODY = "Invalid body",
  INVALID_CREDENTIALS = "Invalid Credentials",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  NOT_FOUND = "Not Found",
}
export enum HttpStatus {
  BAD_REQUEST = 400,
  UNATHURIZED = 401,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  INTERNAL_SERVER_ERROR = 500,
}

export class HttpError extends Error {
  status: HttpStatus;
  message: ErrorMessages;
  constructor(status: HttpStatus, message: ErrorMessages) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export const handleError = async (e: unknown, res: Response) => {
  console.log(e);
  if (e instanceof ZodError) {
    return res.status(400).send(ErrorMessages.INVALID_BODY);
  }
  if (e instanceof HttpError) {
    return res.status(e.status).send(e.message);
  }
  return res.status(500).send(ErrorMessages.INTERNAL_SERVER_ERROR);
};
