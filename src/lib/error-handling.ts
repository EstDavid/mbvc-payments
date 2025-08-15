import { ZodError } from "zod";

export function getZodIssues (error: ZodError) {
  return Object.fromEntries(
    error.issues.map((issue) => [issue.path.join('.'), issue.message])
  );
}

export async function handleResponseError (res: Response, contextMessage = "Request failed") {
  if (!res.ok) {
    let errorMessage = contextMessage;
    try {
      const errorResponse = await res.json();
      if (errorResponse?.message) {
        errorMessage += `: ${errorResponse.message}`;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new RedsysServerError(errorMessage, res.status);
  }
}

export class RedsysServerError extends Error {
  status: number;
  constructor (message: string, status: number) {
    super(message);
    this.name = "RedsysServerError";
    this.status = status;
  }
}

export class RedsysGatewayError extends Error {
  code: string;
  constructor (message: string, code: string) {
    super(message);
    this.name = "RedsysGatewayError";
    this.code = code;
  }
}

export class EncodedResponseValidationError extends Error {
  constructor (message: string) {
    super(message);
    this.name = "EncodedResponseValidationError";
  }
}

export class DecodedResponseValidationError extends Error {
  constructor (message: string) {
    super(message);
    this.name = "DecodedResponseValidationError";
  }
}