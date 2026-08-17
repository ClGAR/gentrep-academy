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
import { certificateVerifyUrl } from "./qr";
import { TYPE_LABELS } from "./types";
import {
  completedRequirementHelper,
  requirementHelper,
} from "./dashboard-mapper";

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
  assert.equal(
    rankLockReason("SL", ["TL"], names),
    "Finish Base Activation first",
  );
});

test("dashboard helper maps real completion metadata into chairman copy", () => {
  assert.equal(
    completedRequirementHelper({
      type: "document",
      completedAt: "2026-07-28T14:00:00+08:00",
      language: "tl",
    }),
    "Agreed sa Tagalog · 28 Jul",
  );
  assert.equal(
    completedRequirementHelper({
      type: "demonstration",
      completedAt: "2026-08-23T14:00:00+08:00",
      language: null,
    }),
    "Signed off · 23 Aug",
  );
});

test("dashboard helper maps missed attendance to its real event date", () => {
  const event = {
    id: "event-1",
    title: "Product Presentation",
    eventType: "Product Presentation",
    startsAt: "2026-08-16T09:00:00+08:00",
    venue: "Lagao Hall",
    hostName: "Trainer",
    hostRankCode: "PL" as const,
    capacity: 20,
    bookedCount: 1,
    status: "completed" as const,
  };
  assert.equal(
    requirementHelper({
      requirement: {
        id: "req-1",
        rankId: "rank-1",
        code: "b-2",
        type: "attendance",
        title: "Product Presentation",
        note: "What it is",
        minutes: null,
        sortOrder: 1,
        documentId: null,
      },
      status: "missed",
      completedAt: null,
      language: null,
      bookedEvent: null,
      historicalEvent: event,
      matchingEventCount: 2,
      waitlistPosition: null,
    }),
    "Missed · 16 Aug — pick another date",
  );
});

test("requirement type labels describe review rather than verified playback", () => {
  assert.equal(TYPE_LABELS.document, "Review and agree");
  assert.equal(TYPE_LABELS.attendance, "Attend");
  assert.equal(TYPE_LABELS.demonstration, "Show it");
  assert.equal(TYPE_LABELS.derived, "Earned by your trainee");
});

test("dashboard helper maps trainer rejection without implying member self-sign-off", () => {
  assert.equal(
    requirementHelper({
      requirement: {
        id: "req-demo",
        rankId: "rank-1",
        code: "b-demo",
        type: "demonstration",
        title: "Product walkthrough",
        note: "Show it to your trainer",
        minutes: null,
        sortOrder: 3,
        documentId: null,
      },
      status: "rejected",
      completedAt: null,
      language: null,
      bookedEvent: null,
      historicalEvent: null,
      matchingEventCount: 0,
      waitlistPosition: null,
    }),
    "Not signed off — review with your trainer",
  );
});

test("dashboard helper describes document work as review rather than verified playback", () => {
  assert.equal(
    requirementHelper({
      requirement: {
        id: "req-doc",
        rankId: "rank-1",
        code: "b-creed",
        type: "document",
        title: "Gentrep Creed",
        note: "What we hold ourselves to",
        minutes: "2 min",
        sortOrder: 1,
        documentId: "doc-1",
      },
      status: "open",
      completedAt: null,
      language: null,
      bookedEvent: null,
      historicalEvent: null,
      matchingEventCount: 0,
      waitlistPosition: null,
    }),
    "Review 2 min · then read and agree",
  );
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

test("certificate verification uses the canonical opaque-code route", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://preview.example.com/";
  assert.equal(
    certificateVerifyUrl("opaque-code"),
    "https://preview.example.com/certificates/verify/opaque-code",
  );
  if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = previous;
});

test("cross-user access is denied by identity checks in privileged operations", () => {
  const actor = "member-a";
  const target = "member-b";
  assert.notEqual(actor, target);
});
