"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { runCmsAction, saveCmsEntryAction } from "@/lib/actions/admin";
import {
  CMS_COLLECTIONS,
  canPerformCmsAction,
  clinicianMayEditCollection,
  type CmsAction,
} from "@/lib/admin/cms";
import { primaryPortalRole } from "@/lib/admin/rbac";
import type { CmsEntryRecord } from "@/lib/admin/types";
import { AdminHero } from "@/components/admin/AdminHero";
import { StatusChip, statusTone } from "@/components/admin/StatusChip";

const ACTION_LABEL: Record<CmsAction, string> = {
  save: "Save draft",
  submit_review: "Send for review",
  approve: "Approve",
  reject: "Return to draft",
  publish: "Publish",
  archive: "Archive",
  restore: "Restore",
};

export function CmsEditor({
  entry,
  roles,
}: {
  entry: CmsEntryRecord | null;
  roles: readonly string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [title, setTitle] = useState(entry?.title ?? "");
  const [slug, setSlug] = useState(entry?.slug ?? "");
  const [collection, setCollection] = useState(entry?.collection ?? "education");
  const [excerpt, setExcerpt] = useState(entry?.excerpt ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [locale, setLocale] = useState(entry?.locale ?? "en");
  const portalRole = primaryPortalRole(roles);
  const availableCollections = CMS_COLLECTIONS.filter(
    (item) => clinicianMayEditCollection(portalRole, item) || item === entry?.collection,
  );
  const workflow = {
    status: entry?.status ?? "draft",
    collection,
    clinicalReview: entry?.clinicalReview ?? "not_required",
  };
  const actions = (
    ["submit_review", "approve", "reject", "publish", "archive", "restore"] as CmsAction[]
  ).filter((action) => (entry ? canPerformCmsAction(roles, workflow, action) : false));
  const canSave =
    clinicianMayEditCollection(portalRole, collection) && canPerformCmsAction(roles, workflow, "save");

  return (
    <div className="admin-stack">
      <AdminHero
        crumbs={[
          { href: "/admin/content", label: "Content" },
          { label: entry ? "Edit entry" : "New entry" },
        ]}
        kicker="CMS"
        title={entry ? "Edit entry" : "New entry"}
        aside={entry ? <StatusChip value={entry.status} tone={statusTone(entry.status)} /> : null}
      />
      {error ? <div className="gg-alert gg-alert--error">{error}</div> : null}
      <form
        className="admin-card admin-stack"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            setError("");
            const result = await saveCmsEntryAction({
              id: entry?.id,
              collection,
              title,
              slug,
              excerpt,
              body,
              locale,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            const id = (result.data as { id?: string } | undefined)?.id ?? entry?.id;
            if (id && !entry) router.push(`/admin/content/${id}`);
            else router.refresh();
          });
        }}
      >
        <label className="gg-field">
          <span className="gg-field__label">Title</span>
          <input className="gg-field__control" value={title} onChange={(event) => setTitle(event.target.value)} disabled={!canSave} />
        </label>
        <div className="admin-grid">
          <label className="gg-field">
            <span className="gg-field__label">Slug</span>
            <input className="gg-field__control" value={slug} onChange={(event) => setSlug(event.target.value)} disabled={!canSave} />
          </label>
          <label className="gg-field">
            <span className="gg-field__label">Collection</span>
            <select
              className="gg-field__control"
              value={collection}
              onChange={(event) => setCollection(event.target.value as typeof collection)}
              disabled={!canSave || Boolean(entry)}
            >
              {availableCollections.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="gg-field">
            <span className="gg-field__label">Locale</span>
            <select className="gg-field__control" value={locale} onChange={(event) => setLocale(event.target.value)} disabled={!canSave}>
              <option value="en">English</option>
              <option value="tl">Filipino</option>
            </select>
          </label>
        </div>
        <label className="gg-field">
          <span className="gg-field__label">Excerpt</span>
          <input className="gg-field__control" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} disabled={!canSave} />
        </label>
        <label className="gg-field">
          <span className="gg-field__label">Body</span>
          <textarea className="gg-field__control admin-textarea" value={body} onChange={(event) => setBody(event.target.value)} rows={12} disabled={!canSave} />
        </label>
        {canSave ? (
          <button
            className={`gg-button ${actions.includes("publish") ? "gg-button--secondary" : "gg-button--primary"}`}
            disabled={pending}
            type="submit"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        ) : (
          <p className="helper">This role can read published language. It cannot edit it.</p>
        )}
      </form>
      {actions.length > 0 ? (
        <div className="admin-actions">
          {actions.map((action) => (
            <button
              key={action}
              className={`gg-button gg-button--sm ${action === "publish" ? "gg-button--primary" : "gg-button--secondary"}`}
              disabled={pending || !entry}
              onClick={() =>
                startTransition(async () => {
                  if (!entry) return;
                  setError("");
                  const result = await runCmsAction({ entryId: entry.id, action });
                  if (!result.ok) setError(result.error);
                  else router.refresh();
                })
              }
            >
              {ACTION_LABEL[action]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
