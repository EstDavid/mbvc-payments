import { ZodError } from "zod";

export function getZodIssues (error: ZodError) {
  return Object.fromEntries(
    error.issues.map((issue) => [issue.path.join('.'), issue.message])
  );
}