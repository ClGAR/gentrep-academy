const FUTURE_JWT_PATTERN = /jwt issued at future/i;

function collectText(value: unknown, depth = 0): string {
  if (depth > 4 || value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => collectText(item, depth + 1)).join(" ");
  if (typeof value === "object") {
    return Object.values(value)
      .map((item) => collectText(item, depth + 1))
      .join(" ");
  }
  return "";
}

export function isFutureJwtMessage(value: unknown) {
  return FUTURE_JWT_PATTERN.test(collectText(value));
}

export const SESSION_OPENING_MESSAGE =
  "Your session is still opening. Wait a moment and try again.";

export function toPublicErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Try again.",
) {
  if (isFutureJwtMessage(error)) return SESSION_OPENING_MESSAGE;
  if (typeof error === "string" && error.trim()) return error.trim();
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return isFutureJwtMessage(error.message)
      ? SESSION_OPENING_MESSAGE
      : error.message.trim();
  }
  return fallback;
}

export const FUTURE_JWT_RETRY_DELAYS_MS = [1000, 2000, 4000, 6000] as const;

export async function wait(delayMs: number) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function withFutureJwtRetry<T>(
  run: () => Promise<T>,
  shouldRetry: (result: T) => boolean,
  delays: readonly number[] = FUTURE_JWT_RETRY_DELAYS_MS,
) {
  let result = await run();
  for (const delayMs of delays) {
    if (!shouldRetry(result)) return result;
    await wait(delayMs);
    result = await run();
  }
  return result;
}
