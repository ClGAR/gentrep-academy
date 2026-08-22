import assert from "node:assert/strict";
import test from "node:test";
import {
  academyDeskLinks,
  canAccessMemberRecord,
  canViewUserField,
  capabilitiesFor,
  hasCapability,
  homePath,
  navFor,
  personaLabel,
  primaryPortalRole,
} from "./rbac";

test("academy admin maps to Super Admin and receives every portal capability", () => {
  const roles = ["member", "admin"];
  assert.equal(primaryPortalRole(roles), "admin");
  assert.equal(personaLabel(roles), "Super Admin");
  assert.equal(hasCapability(roles, "users.write_roles"), true);
  assert.equal(hasCapability(roles, "content.publish"), true);
  assert.equal(hasCapability(roles, "audit.read"), true);
  assert.equal(homePath(roles), "/admin");
});

test("clinician nav is caseload and content, never the global directory or tickets", () => {
  const hrefs = navFor(["clinician"]).map((item) => item.href);
  assert.deepEqual(hrefs, ["/admin", "/admin/caseload", "/admin/content"]);
  assert.equal(hasCapability(["clinician"], "users.directory"), false);
  assert.equal(hasCapability(["clinician"], "users.read_clinical"), true);
  assert.equal(hasCapability(["clinician"], "tickets.read"), false);
  assert.equal(hasCapability(["clinician"], "content.clinical_review"), true);
  assert.equal(homePath(["clinician"]), "/admin");
  assert.equal(hasCapability(["clinician"], "content.publish"), false);
});

test("support can search people and tickets but cannot read clinical notes or publish", () => {
  const hrefs = navFor(["support"]).map((item) => item.href);
  assert.deepEqual(hrefs, ["/admin", "/admin/users", "/admin/content", "/admin/tickets"]);
  assert.equal(canViewUserField(["support"], "clinicalNotes"), false);
  assert.equal(canViewUserField(["support"], "supportNotes"), true);
  assert.equal(canViewUserField(["support"], "memberCard"), true);
  assert.equal(canViewUserField(["clinician"], "memberCard"), false);
  assert.equal(canViewUserField(["clinician"], "clinicalNotes"), true);
  assert.equal(hasCapability(["support"], "users.write_status"), true);
  assert.equal(hasCapability(["support"], "users.write_roles"), false);
  assert.equal(homePath(["support"]), "/admin");
});

test("clinician may open only assigned member records", () => {
  const assigned = canAccessMemberRecord({
    roles: ["clinician"],
    actorId: "clin-1",
    memberId: "mem-1",
    assignedMemberIds: ["mem-1"],
  });
  const stranger = canAccessMemberRecord({
    roles: ["clinician"],
    actorId: "clin-1",
    memberId: "mem-2",
    assignedMemberIds: ["mem-1"],
  });
  const support = canAccessMemberRecord({
    roles: ["support"],
    actorId: "sup-1",
    memberId: "mem-2",
    assignedMemberIds: [],
  });
  assert.equal(assigned, true);
  assert.equal(stranger, false);
  assert.equal(support, true);
});

test("members and trainers stay on academy desks, not the admin portal", () => {
  assert.equal(homePath(["member"]), "/academy");
  assert.equal(homePath(["member", "trainer"]), "/trainer/verifications");
  assert.equal(homePath(["member", "staff"]), "/staff/events");
  assert.equal(capabilitiesFor(["member", "trainer"]).size, 0);
  assert.deepEqual(academyDeskLinks(["admin"]).map((link) => link.href), [
    "/academy",
    "/staff/events",
    "/trainer/verifications",
  ]);
  assert.deepEqual(academyDeskLinks(["clinician"]), []);
});
