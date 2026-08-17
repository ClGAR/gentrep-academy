import assert from "node:assert/strict";
import test from "node:test";
import { isFutureJwtMessage, toPublicErrorMessage } from "./jwt";

test("future JWT detection covers nested and raw strings", () => {
  assert.equal(isFutureJwtMessage("JWT issued at future"), true);
  assert.equal(isFutureJwtMessage({ message: "JWT issued at future" }), true);
  assert.equal(isFutureJwtMessage({ error: { msg: "JWT issued at future" } }), true);
  assert.equal(isFutureJwtMessage("Invalid login credentials"), false);
});

test("public error copy never includes a future JWT phrase", () => {
  assert.equal(
    toPublicErrorMessage("JWT issued at future"),
    "Your session is still opening. Wait a moment and try again.",
  );
  assert.equal(
    toPublicErrorMessage({ message: "JWT issued at future" }),
    "Your session is still opening. Wait a moment and try again.",
  );
  assert.equal(toPublicErrorMessage("Invalid login credentials"), "Invalid login credentials");
});
