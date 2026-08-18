import assert from "node:assert/strict";
import test from "node:test";
import { createSupabaseFetch } from "./fetch";

const futureJwtResponse = () =>
  Response.json(
    { message: "JWT issued at future" },
    { status: 401 },
  );

test("Supabase fetch passes normal responses through", async () => {
  let calls = 0;
  const wrappedFetch = createSupabaseFetch({
    fetchImpl: async () => {
      calls += 1;
      return Response.json({ ok: true });
    },
    sleep: async () => undefined,
  });

  const response = await wrappedFetch("https://example.test/rest/v1/ranks");

  assert.equal(calls, 1);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("Supabase fetch recovers from a transient future JWT response", async () => {
  let calls = 0;
  const delays: number[] = [];
  const wrappedFetch = createSupabaseFetch({
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? futureJwtResponse()
        : Response.json({ ok: true });
    },
    sleep: async (delayMs) => {
      delays.push(delayMs);
    },
  });

  const response = await wrappedFetch("https://example.test/rest/v1/profiles");

  assert.equal(calls, 2);
  assert.deepEqual(delays, [1000]);
  assert.equal(response.status, 200);
});

test("Supabase fetch recognizes the Auth-style msg field", async () => {
  let calls = 0;
  const wrappedFetch = createSupabaseFetch({
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? Response.json(
            { msg: "JWT issued at future" },
            { status: 401 },
          )
        : Response.json({ ok: true });
    },
    sleep: async () => undefined,
  });

  const response = await wrappedFetch("https://example.test/auth/v1/user");

  assert.equal(calls, 2);
  assert.equal(response.status, 200);
});

test("Supabase fetch recovers from a nested future JWT error body", async () => {
  let calls = 0;
  const wrappedFetch = createSupabaseFetch({
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? Response.json(
            { error: "JWT issued at future", hint: "clock skew" },
            { status: 401 },
          )
        : Response.json({ ok: true });
    },
    sleep: async () => undefined,
  });

  const response = await wrappedFetch("https://example.test/rest/v1/profiles");

  assert.equal(calls, 2);
  assert.equal(response.status, 200);
});

test("Supabase fetch does not retry unrelated authentication errors", async () => {
  let calls = 0;
  const wrappedFetch = createSupabaseFetch({
    fetchImpl: async () => {
      calls += 1;
      return Response.json(
        { message: "JWT expired" },
        { status: 401 },
      );
    },
    sleep: async () => {
      throw new Error("Unrelated errors must not sleep or retry.");
    },
  });

  const response = await wrappedFetch("https://example.test/rest/v1/profiles");

  assert.equal(calls, 1);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "JWT expired" });
});

test("Supabase fetch preserves POST request bodies across retries", async () => {
  const bodies: string[] = [];
  const methods: string[] = [];
  const wrappedFetch = createSupabaseFetch({
    fetchImpl: async (input, init) => {
      const request = new Request(input, init);
      methods.push(request.method);
      bodies.push(await request.text());
      return bodies.length === 1
        ? futureJwtResponse()
        : Response.json({ ok: true });
    },
    sleep: async () => undefined,
  });

  const response = await wrappedFetch(
    "https://example.test/auth/v1/user",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "update-profile" }),
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(methods, ["POST", "POST"]);
  assert.deepEqual(bodies, [
    '{"action":"update-profile"}',
    '{"action":"update-profile"}',
  ]);
});
