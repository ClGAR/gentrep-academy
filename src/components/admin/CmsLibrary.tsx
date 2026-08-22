"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CMS_COLLECTIONS, CMS_STATUSES } from "@/lib/admin/cms";
import type { CmsEntrySummary } from "@/lib/admin/types";
import { FilterBar } from "@/components/admin/FilterBar";
import { StatusChip, statusTone } from "@/components/admin/StatusChip";

export function CmsLibrary({
  rows,
  queryStatus,
  queryCollection,
  canWrite,
}: {
  rows: CmsEntrySummary[];
  queryStatus: string;
  queryCollection: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  return (
    <>
      <FilterBar action="/admin/content">
        <label className="gg-field admin-toolbar__grow">
          <span className="gg-field__label">Collection</span>
          <select className="gg-field__control" name="collection" defaultValue={queryCollection}>
            <option value="all">All</option>
            {(canWrite ? CMS_COLLECTIONS : (["education", "faq"] as const)).map((slug) => (
              <option key={slug} value={slug}>
                {slug.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        {canWrite ? (
          <label className="gg-field">
            <span className="gg-field__label">Status</span>
            <select className="gg-field__control" name="status" defaultValue={queryStatus}>
              <option value="all">All</option>
              {CMS_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </FilterBar>
      {canWrite ? (
        <p>
          <Link className="gg-button gg-button--primary" href="/admin/content/new">
            New entry
          </Link>
        </p>
      ) : null}
      {rows.length === 0 ? (
        <div className="gg-empty">
          <b>No entries in this filter</b>
          <span>{canWrite ? "Write a draft, then send protocol and product copy for review." : "Only published FAQ and education appear on this desk."}</span>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Collection</th>
                <th>Review</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="admin-row" onClick={() => router.push(`/admin/content/${row.id}`)}>
                  <td>
                    <b>{row.title}</b>
                    <div className="helper">{row.slug}</div>
                  </td>
                  <td>{row.collectionLabel}</td>
                  <td>
                    <StatusChip value={row.clinicalReview} tone={statusTone(row.clinicalReview)} />
                  </td>
                  <td>
                    <StatusChip value={row.status} tone={statusTone(row.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
