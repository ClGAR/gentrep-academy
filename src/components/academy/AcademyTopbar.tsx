"use client";

import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import type { ProfileRecord } from "@/lib/academy/types";
import { initials, teamFullName } from "@/components/academy/helpers";

export function AcademyTopbar({ profile }: { profile: ProfileRecord }) {
  return (
    <header className="topbar">
      <Link className="brand topbar-brand only-mobile" href="/academy">
        <strong>GutGuard</strong>
        <em>Academy</em>
      </Link>
      <div className="who topbar-who">
        <span className="avatar">{initials(profile.fullName)}</span>
        <span>
          <b>{profile.fullName}</b>
          <em>{teamFullName(profile.teamName)}</em>
        </span>
        <form action={signOut} className="topbar-out-form">
          <button className="tap pill-btn" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
