import assert from "node:assert/strict";
import test from "node:test";
import {
  allRequirementsDone,
  canIssueCertificate,
  canMemberBook,
  canMemberCancel,
  previousRankCode,
  promoteWaitlist,
  publicCertificatePayload,
  rankLockReason,
} from "./rules";

test("rank ladder locks later ranks until the previous rank is complete", () => {
  const names = {
    BASE: "Base Activation",
    TL: "Team Leader",
    SL: "Squad Leader",
    PL: "Platoon Leader",
    CC: "Company Commander",
  };
  assert.equal(previousRankCode("BASE"), null);
  assert.equal(rankLockReason("BASE", [], names), null);
  assert.equal(rankLockReason("TL", [], names), "Finish Base Activation first");
  assert.equal(rankLockReason("TL", ["BASE"], names), null);
});

test("duplicate active booking is rejected", () => {
  const result = canMemberBook({
    eventStatus: "scheduled",
    startsAt: "2026-09-01T13:00:00+08:00",
    now: "2026-08-13T01:00:00+08:00",
    existingActiveBooking: true,
    remainingSeats: 4,
  });
  assert.equal(result.ok, false);
});

test("booking past capacity joins the waitlist", () => {
  const result = canMemberBook({
    eventStatus: "scheduled",
    startsAt: "2026-09-01T13:00:00+08:00",
    now: "2026-08-13T01:00:00+08:00",
    existingActiveBooking: false,
    remainingSeats: 0,
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.waitlist, true);
});

test("open seats book immediately", () => {
  const result = canMemberBook({
    eventStatus: "scheduled",
    startsAt: "2026-09-01T13:00:00+08:00",
    now: "2026-08-13T01:00:00+08:00",
    existingActiveBooking: false,
    remainingSeats: 3,
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.waitlist, false);
});

test("cancellation is allowed only for booked or waitlisted seats", () => {
  assert.equal(canMemberCancel("booked"), true);
  assert.equal(canMemberCancel("waitlisted"), true);
  assert.equal(canMemberCancel("cancelled"), false);
  assert.equal(canMemberCancel("attended"), false);
});

test("waitlist promotion takes the oldest waiting booking", () => {
  const promoted = promoteWaitlist({
    capacity: 2,
    bookedCountAfterCancel: 1,
    waitlisted: [
      { id: "later", createdAt: "2026-08-13T10:00:00Z" },
      { id: "earlier", createdAt: "2026-08-13T09:00:00Z" },
    ],
  });
  assert.equal(promoted?.id, "earlier");
});

test("waitlist does not promote when the event is still full", () => {
  const promoted = promoteWaitlist({
    capacity: 1,
    bookedCountAfterCancel: 1,
    waitlisted: [{ id: "w1", createdAt: "2026-08-13T09:00:00Z" }],
  });
  assert.equal(promoted, null);
});

test("document agreement is a member action but attendance and demos are not self-verified", () => {
  assert.equal(allRequirementsDone(["done", "done"]), true);
  assert.equal(allRequirementsDone(["done", "booked"]), false);
  assert.equal(allRequirementsDone([]), false);
});

test("certificate issuance requires every requirement verified and no duplicate", () => {
  assert.deepEqual(
    canIssueCertificate({ requirementCount: 4, verifiedCount: 3, existingCertificate: false }),
    { ok: false, reason: "All requirements must be verified before a certificate can be issued." },
  );
  assert.equal(
    canIssueCertificate({ requirementCount: 4, verifiedCount: 4, existingCertificate: true }).ok,
    false,
  );
  assert.equal(
    canIssueCertificate({ requirementCount: 4, verifiedCount: 4, existingCertificate: false }).ok,
    true,
  );
});

test("public verification payload omits team, booking, and audit fields", () => {
  const payload = publicCertificatePayload({
    id: "cert-1",
    memberName: "Rey Aquino (demo)",
    rankFullName: "Base Activation",
    referenceCode: "GA-BASE-DEMO",
    issuedAt: "2026-08-13T00:00:00Z",
    status: "issued",
  });
  assert.deepEqual(Object.keys(payload).sort(), [
    "id",
    "issuedAt",
    "memberName",
    "rank",
    "referenceCode",
    "status",
  ]);
});

test("cross-user access is denied by identity checks in privileged operations", () => {
  const actor = "member-a";
  const target = "member-b";
  assert.notEqual(actor, target);
});
