"use client";

import { useRouter } from "next/navigation";
import { canViewUserField, hasCapability } from "@/lib/admin/rbac";
import type { DirectoryUser } from "@/lib/admin/types";
import { StatusChip, statusTone } from "@/components/admin/StatusChip";
import { FilterBar } from "@/components/admin/FilterBar";

export function UserDirectory({
  rows,
  roles,
  query,
  status,
}: {
  rows: DirectoryUser[];
  roles: readonly string[];
  query: string;
  status: string;
}) {
  const router = useRouter();
  const showCard = canViewUserField(roles, "memberCard");
  const canOpen = hasCapability(roles, "users.directory") || hasCapability(roles, "users.read_assigned");

  return (
    <>
      <FilterBar action="/admin/users">
        <label className="gg-field admin-toolbar__grow">
          <span className="gg-field__label">Search</span>
          <span className="admin-search">
            <span className="admin-search__ico" aria-hidden="true">
              ⌕
            </span>
            <input
              className="gg-field__control"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Name, email, or card"
              autoComplete="off"
            />
          </span>
        </label>
        <label className="gg-field">
          <span className="gg-field__label">Status</span>
          <select className="gg-field__control" name="status" defaultValue={status}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="invited">Invited</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </FilterBar>
      {rows.length === 0 ? (
        <div className="gg-empty">
          <b>No people match this desk</b>
          <span>Search by name, email, or card, then open one record.</span>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {showCard ? <th>Card</th> : null}
                <th>Rank</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={canOpen ? "admin-row" : undefined}
                  onClick={canOpen ? () => router.push(`/admin/users/${row.id}`) : undefined}
                >
                  <td>
                    <b>{row.fullName}</b>
                    <div className="helper">{row.teamName ?? "No team"}</div>
                  </td>
                  <td>{row.email ?? "—"}</td>
                  {showCard ? <td>{row.memberCard ?? "—"}</td> : null}
                  <td>{row.rankName ?? "—"}</td>
                  <td>
                    <StatusChip value={row.accountStatus} tone={statusTone(row.accountStatus)} />
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
