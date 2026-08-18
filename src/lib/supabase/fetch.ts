import { FUTURE_JWT_RETRY_DELAYS_MS, isFutureJwtMessage } from "@/lib/supabase/jwt";

type SupabaseFetchOptions = {
  fetchImpl?: typeof fetch;
  sleep?: (delayMs: number) => Promise<void>;
  retryDelays?: readonly number[];
};

async function isFutureJwtResponse(response: Response) {
  if (response.status !== 401 && response.status !== 403) return false;

  const raw = await response.clone().text();
  if (isFutureJwtMessage(raw)) return true;
  try {
    return isFutureJwtMessage(JSON.parse(raw) as unknown);
  } catch {
    return false;
  }
}

export function createSupabaseFetch({
  fetchImpl = fetch,
  sleep = (delayMs) =>
    new Promise((resolve) => setTimeout(resolve, delayMs)),
  retryDelays = FUTURE_JWT_RETRY_DELAYS_MS,
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
