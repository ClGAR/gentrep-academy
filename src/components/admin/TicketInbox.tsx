"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setSupportCaseStatusAction } from "@/lib/actions/admin";
import { CASE_STATUSES } from "@/lib/admin/types";
import type { SupportCase } from "@/lib/admin/types";
import { FilterBar } from "@/components/admin/FilterBar";
import { StatusChip, statusTone } from "@/components/admin/StatusChip";

export function TicketInbox({
  rows,
  status,
  canWrite,
}: {
  rows: SupportCase[];
  status: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <>
      <FilterBar action="/admin/tickets">
        <label className="gg-field">
          <span className="gg-field__label">Status</span>
          <select className="gg-field__control" name="status" defaultValue={status}>
            <option value="all">All</option>
            {CASE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </FilterBar>
      {rows.length === 0 ? (
        <div className="gg-empty">
          <b>Inbox is clear</b>
          <span>Change the status filter, or open a ticket from a member record.</span>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Member</th>
                <th>Priority</th>
                <th>Status</th>
                {canWrite ? <th>Advance</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <b>{row.title}</b>
                    <div className="helper">{row.topic}</div>
                  </td>
                  <td>
                    <button className="admin-link" type="button" onClick={() => router.push(`/admin/users/${row.memberId}`)}>
                      {row.memberName}
                    </button>
                  </td>
                  <td>
                    <StatusChip value={row.priority} tone={statusTone(row.priority)} />
                  </td>
                  <td>
                    <StatusChip value={row.status} tone={statusTone(row.status)} />
                  </td>
                  {canWrite ? (
                    <td>
                      <select
                        className="gg-field__control"
                        defaultValue={row.status}
                        disabled={pending}
                        onChange={(event) =>
                          startTransition(async () => {
                            await setSupportCaseStatusAction({
                              caseId: row.id,
                              status: event.target.value,
                            });
                            router.refresh();
                          })
                        }
                      >
                        {CASE_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
