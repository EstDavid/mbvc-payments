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

export function addQueryParameterToAbsoluteUrl (url: string, paramName: string, paramValue: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set(paramName, paramValue);
    return urlObj.toString();
  } catch {
    // If URL is invalid, return the original URL
    console.error('Invalid URL provided:', url);
    return url;
  }
}