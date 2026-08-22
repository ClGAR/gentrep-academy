import assert from "node:assert/strict";
import test from "node:test";
import {
  applyCmsAction,
  canPerformCmsAction,
  canPublish,
  clinicianMayEditCollection,
  collectionRequiresClinicalReview,
  defaultClinicalReview,
} from "./cms";

test("protocol and product copy require a dietitian review before publish", () => {
  assert.equal(collectionRequiresClinicalReview("protocol"), true);
  assert.equal(collectionRequiresClinicalReview("product_copy"), true);
  assert.equal(collectionRequiresClinicalReview("education"), false);
  assert.equal(defaultClinicalReview("protocol"), "pending");
  assert.equal(canPublish({ status: "draft", collection: "education", clinicalReview: "not_required" }), true);
  assert.equal(canPublish({ status: "in_review", collection: "protocol", clinicalReview: "pending" }), false);
  assert.equal(canPublish({ status: "in_review", collection: "protocol", clinicalReview: "approved" }), true);
});

test("only Super Admin can publish; clinician can review but not go live", () => {
  const protocol = { status: "in_review" as const, collection: "protocol" as const, clinicalReview: "approved" as const };
  assert.equal(canPerformCmsAction(["admin"], protocol, "publish"), true);
  assert.equal(canPerformCmsAction(["clinician"], protocol, "publish"), false);
  assert.equal(
    canPerformCmsAction(
      ["clinician"],
      { status: "in_review", collection: "protocol", clinicalReview: "pending" },
      "approve",
    ),
    true,
  );
  assert.equal(canPerformCmsAction(["support"], protocol, "save"), false);
  assert.equal(canPerformCmsAction(["support"], protocol, "publish"), false);
});

test("rejecting review returns the entry to draft", () => {
  const next = applyCmsAction(
    { status: "in_review", collection: "protocol", clinicalReview: "pending" },
    "reject",
  );
  assert.deepEqual(next, { status: "draft", collection: "protocol", clinicalReview: "rejected" });
});

test("clinicians author protocols and education, not product copy", () => {
  assert.equal(clinicianMayEditCollection("clinician", "protocol"), true);
  assert.equal(clinicianMayEditCollection("clinician", "education"), true);
  assert.equal(clinicianMayEditCollection("clinician", "product_copy"), false);
  assert.equal(clinicianMayEditCollection("admin", "product_copy"), true);
  assert.equal(clinicianMayEditCollection("support", "education"), false);
});
