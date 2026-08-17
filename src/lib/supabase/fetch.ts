const FUTURE_JWT_MESSAGE = "JWT issued at future";
const RETRY_DELAYS_MS = [750, 1500, 2500] as const;

type SupabaseFetchOptions = {
  fetchImpl?: typeof fetch;
  sleep?: (delayMs: number) => Promise<void>;
  retryDelays?: readonly number[];
};

async function isFutureJwtResponse(response: Response) {
  if (response.status !== 401) return false;

  try {
    const body: unknown = await response.clone().json();
    if (typeof body !== "object" || body === null) return false;
    const message =
      "message" in body
        ? body.message
        : "msg" in body
          ? body.msg
          : undefined;
    return message === FUTURE_JWT_MESSAGE;
  } catch {
    return false;
  }
}

export function createSupabaseFetch({
  fetchImpl = fetch,
  sleep = (delayMs) =>
    new Promise((resolve) => setTimeout(resolve, delayMs)),
  retryDelays = RETRY_DELAYS_MS,
}: SupabaseFetchOptions = {}): typeof fetch {
  return async (input, init) => {
    const request = new Request(input, init);

    for (let attempt = 0; ; attempt += 1) {
      const response = await fetchImpl(request.clone());
      const retryDelay = retryDelays[attempt];

      if (
        retryDelay === undefined ||
        !(await isFutureJwtResponse(response))
      ) {
        return response;
      }

      await sleep(retryDelay);
    }
  };
}

export const supabaseFetch = createSupabaseFetch();
