"use client";

import { GentrepMark } from "@/components/academy/GentrepMark";
import { teamFullName } from "@/components/academy/helpers";
import { GA } from "@/components/academy/tokens";

export function MobileAcademyHeader({
  name,
  teamName,
  onAbout,
}: {
  name: string;
  teamName: string | null;
  onAbout: () => void;
}) {
  return (
    <>
      <header className="mast only-mobile">
        <div className="brand">
          <GentrepMark height={26} color={GA.navy} />
          <span className="serif big">Academy</span>
        </div>
        <button className="tap pill sm" onClick={onAbout}>
          About
        </button>
      </header>
      <p className="sub only-mobile">
        {name} · {teamFullName(teamName)}
      </p>
    </>
  );
}
