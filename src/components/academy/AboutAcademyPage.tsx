"use client";

import { useRouter } from "next/navigation";
import { AboutAcademy } from "@/components/academy/AboutAcademy";
import { AcademySidebar } from "@/components/academy/AcademySidebar";
import { AcademyTopbar } from "@/components/academy/AcademyTopbar";
import { RankLadder } from "@/components/academy/RankLadder";
import { nextOpenRequirement } from "@/lib/academy/rules";
import type { DashboardData } from "@/lib/academy/types";

export function AboutAcademyPage({ data }: { data: DashboardData }) {
  const router = useRouter();
  const next = nextOpenRequirement(data.requirements);
  const complete =
    data.requirements.length > 0 &&
    data.requirements.every((item) => item.status === "done");

  function goRank(code: string, locked: string | null) {
    if (locked && code !== data.selectedRank.code) return;
    router.push(`/academy/ranks/${code.toLowerCase()}`);
  }

  return (
    <div className="ga" lang="en">
      <div className="shell">
        <AcademySidebar
          data={data}
          next={next}
          complete={complete}
          onRank={goRank}
          onNext={() => router.push("/academy")}
        />
        <div className="stage">
          <AcademyTopbar profile={data.profile} />
          <main className="col">
          <RankLadder
            ranks={data.ranks}
            selectedCode={data.selectedRank.code}
            rankProgress={data.rankProgress}
            onRank={goRank}
          />
          <div className="col-inner">
            <AboutAcademy ranks={data.ranks} />
          </div>
          </main>
        </div>
      </div>
    </div>
  );
}
