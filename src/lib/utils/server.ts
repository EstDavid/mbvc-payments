export function formDataToObject (formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    obj[key] = typeof value === "string" ? value : String(value);
  }
  return obj;
}

export function requireEnv (name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}