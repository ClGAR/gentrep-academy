"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addStaffNoteAction,
  assignClinicianAction,
  openSupportCaseAction,
  setAccountStatusAction,
  toggleUserRoleAction,
} from "@/lib/actions/admin";
import { APP_ROLES } from "@/lib/academy/types";
import { canViewUserField, hasCapability } from "@/lib/admin/rbac";
import { ACCOUNT_STATUSES } from "@/lib/admin/types";
import type { UserRecordView } from "@/lib/admin/types";
import { AdminHero } from "@/components/admin/AdminHero";
import { StatusChip, statusTone } from "@/components/admin/StatusChip";

export function UserRecord({
  record,
  roles,
  clinicians = [],
}: {
  record: UserRecordView;
  roles: readonly string[];
  clinicians?: Array<{ id: string; fullName: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const { user } = record;
  const canClinicalNote = hasCapability(roles, "notes.write_clinical");
  const canSupportNoteWrite = hasCapability(roles, "notes.write_support");
  const canNote = canClinicalNote || canSupportNoteWrite;
  const canStatus = hasCapability(roles, "users.write_status");
  const canAssignRoles = hasCapability(roles, "users.write_roles");
  const canTicket = hasCapability(roles, "tickets.write");
  const clinical = canViewUserField(roles, "clinicalNotes");
  const supportNotes = canViewUserField(roles, "supportNotes");
  const showTickets = canViewUserField(roles, "tickets");
  const fullStatusSet = hasCapability(roles, "users.write_roles");
  const [noteKind, setNoteKind] = useState<"clinical" | "support">(canClinicalNote ? "clinical" : "support");
  const [clinicianId, setClinicianId] = useState(record.assignedClinicianId ?? clinicians[0]?.id ?? "");
  const showIdentity =
    canViewUserField(roles, "rank") ||
    canViewUserField(roles, "memberCard") ||
    canViewUserField(roles, "caseload") ||
    canViewUserField(roles, "roles");

  return (
    <div className="admin-stack">
      <AdminHero
        crumbs={[
          {
            href: hasCapability(roles, "users.directory") ? "/admin/users" : "/admin/caseload",
            label: hasCapability(roles, "users.directory") ? "People" : "Caseload",
          },
          { label: user.fullName },
        ]}
        kicker={hasCapability(roles, "users.directory") ? "People" : "Care"}
        title={user.fullName}
        lede={user.email ?? "No email on file"}
        aside={<StatusChip value={user.accountStatus} tone={statusTone(user.accountStatus)} />}
      />
      {error ? <div className="gg-alert gg-alert--error">{error}</div> : null}

      {showIdentity ? (
        <dl className="admin-deflist">
          {canViewUserField(roles, "rank") ? (
            <div>
              <dt>Academy</dt>
              <dd>
                {user.rankName ?? "Unranked"}
                {user.teamName ? ` · ${user.teamName}` : " · No team"}
              </dd>
            </div>
          ) : null}
          {canViewUserField(roles, "memberCard") ? (
            <div>
              <dt>Member card</dt>
              <dd>{user.memberCard ?? "—"}</dd>
            </div>
          ) : null}
          {canViewUserField(roles, "caseload") ? (
            <div>
              <dt>Clinician</dt>
              <dd>{record.assignedClinicianName ?? "Unassigned"}</dd>
            </div>
          ) : null}
          {canViewUserField(roles, "roles") ? (
            <div>
              <dt>Roles</dt>
              <dd>{user.roles.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {canAssignRoles ? (
        <section className="admin-card">
          <p className="eyebrow-dark">Roles</p>
          <p className="helper">Toggle one role at a time. Removing the last role restores member.</p>
          <div className="admin-role-list">
            {APP_ROLES.map((role) => {
              const enabled = user.roles.includes(role);
              return (
                <label key={role}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={pending}
                    onChange={(event) =>
                      startTransition(async () => {
                        setError("");
                        const result = await toggleUserRoleAction({
                          userId: user.id,
                          role,
                          enabled: event.target.checked,
                        });
                        if (!result.ok) setError(result.error);
                        else router.refresh();
                      })
                    }
                  />
                  {role}
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      {canAssignRoles ? (
        <section className="admin-card">
          <p className="eyebrow-dark">Assign clinician</p>
          {clinicians.length === 0 ? (
            <div className="gg-empty">
              <b>No clinicians yet</b>
              <span>Give someone the clinician role, then assign them here.</span>
            </div>
          ) : (
            <>
              <label className="gg-field">
                <span className="gg-field__label">Dietitian</span>
                <select
                  className="gg-field__control"
                  value={clinicianId}
                  onChange={(event) => setClinicianId(event.target.value)}
                >
                  {clinicians.map((clinician) => (
                    <option key={clinician.id} value={clinician.id}>
                      {clinician.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="gg-button gg-button--primary gg-button--sm"
                style={{ marginTop: 12 }}
                disabled={pending || !clinicianId}
                onClick={() =>
                  startTransition(async () => {
                    setError("");
                    const result = await assignClinicianAction({
                      memberId: user.id,
                      clinicianId,
                    });
                    if (!result.ok) setError(result.error);
                    else router.refresh();
                  })
                }
              >
                Assign to caseload
              </button>
            </>
          )}
        </section>
      ) : null}

      {canStatus ? (
        <section className="admin-card">
          <p className="eyebrow-dark">Account</p>
          <div className="admin-actions">
            {fullStatusSet
              ? ACCOUNT_STATUSES.map((status) => (
                  <button
                    key={status}
                    className={`gg-button gg-button--sm ${
                      status === "suspended" ? "gg-button--danger" : "gg-button--secondary"
                    }`}
                    disabled={pending || user.accountStatus === status}
                    onClick={() =>
                      startTransition(async () => {
                        setError("");
                        const result = await setAccountStatusAction({ userId: user.id, status });
                        if (!result.ok) setError(result.error);
                        else router.refresh();
                      })
                    }
                  >
                    {status}
                  </button>
                ))
              : (
                  <>
                    <button
                      className={`gg-button gg-button--sm ${
                        user.accountStatus === "suspended" ? "gg-button--secondary" : "gg-button--primary"
                      }`}
                      disabled={pending || user.accountStatus === "suspended"}
                      onClick={() =>
                        startTransition(async () => {
                          setError("");
                          const result = await setAccountStatusAction({
                            userId: user.id,
                            status: "suspended",
                          });
                          if (!result.ok) setError(result.error);
                          else router.refresh();
                        })
                      }
                    >
                      Place hold
                    </button>
                    <button
                      className={`gg-button gg-button--sm ${
                        user.accountStatus === "suspended" ? "gg-button--primary" : "gg-button--secondary"
                      }`}
                      disabled={pending || user.accountStatus === "active"}
                      onClick={() =>
                        startTransition(async () => {
                          setError("");
                          const result = await setAccountStatusAction({
                            userId: user.id,
                            status: "active",
                          });
                          if (!result.ok) setError(result.error);
                          else router.refresh();
                        })
                      }
                    >
                      Lift hold
                    </button>
                  </>
                )}
          </div>
        </section>
      ) : null}

      {canNote ? (
        <section className="admin-card">
          <p className="eyebrow-dark">{noteKind === "clinical" ? "Clinical note" : "Support note"}</p>
          {canClinicalNote && canSupportNoteWrite ? (
            <label className="gg-field" style={{ marginBottom: 12 }}>
              <span className="gg-field__label">Kind</span>
              <select
                className="gg-field__control"
                value={noteKind}
                onChange={(event) => setNoteKind(event.target.value as "clinical" | "support")}
              >
                <option value="clinical">Clinical</option>
                <option value="support">Support</option>
              </select>
            </label>
          ) : null}
          <textarea
            className="gg-field__control admin-textarea"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              noteKind === "clinical"
                ? "One observation. No diagnosis in the first line."
                : "What the member asked, and what you did."
            }
          />
          <button
            className="gg-button gg-button--primary gg-button--sm"
            style={{ marginTop: 12 }}
            disabled={pending || note.trim().length < 3}
            onClick={() =>
              startTransition(async () => {
                setError("");
                const result = await addStaffNoteAction({
                  subjectUserId: user.id,
                  kind: noteKind,
                  body: note,
                });
                if (!result.ok) setError(result.error);
                else {
                  setNote("");
                  router.refresh();
                }
              })
            }
          >
            Save note
          </button>
        </section>
      ) : null}

      {clinical || supportNotes ? (
        <section className="admin-card">
          <p className="eyebrow-dark">Notes</p>
          {record.notes.length === 0 ? (
            <div className="gg-empty">
              <b>No notes yet</b>
              <span>Write the first note this desk is allowed to keep.</span>
            </div>
          ) : (
            <ol className="admin-feed">
              {record.notes.map((item) => (
                <li key={item.id}>
                  <StatusChip value={item.kind} tone={item.kind === "clinical" ? "gold" : "neutral"} />
                  <b>{item.authorName}</b>
                  <span className="helper">{new Date(item.createdAt).toLocaleString()}</span>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}

      {showTickets ? (
        <section className="admin-card">
          <p className="eyebrow-dark">Tickets</p>
          {record.tickets.length === 0 ? (
            <div className="gg-empty">
              <b>No tickets on this member</b>
              <span>Open a follow-up when identity or access needs a trail.</span>
            </div>
          ) : (
            <ul className="admin-feed">
              {record.tickets.map((ticket) => (
                <li key={ticket.id}>
                  <b>{ticket.title}</b>
                  <span className="helper">
                    {ticket.topic} · {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {canTicket ? (
            <button
              className="gg-button gg-button--primary gg-button--sm"
              style={{ marginTop: 12 }}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError("");
                  const result = await openSupportCaseAction({
                    memberId: user.id,
                    title: `Follow-up · ${user.fullName}`,
                    topic: "account",
                    priority: "normal",
                  });
                  if (!result.ok) setError(result.error);
                  else router.refresh();
                })
              }
            >
              Open ticket
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
