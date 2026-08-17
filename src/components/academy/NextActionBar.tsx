"use client";

import type { RequirementView } from "@/lib/academy/types";
import { GA } from "@/components/academy/tokens";
import { requirementActionLabel } from "@/components/academy/helpers";

export function NextActionBar({
  next,
  onNext,
}: {
  next: RequirementView;
  onNext: () => void;
}) {
  return (
    <div className="foot only-mobile">
      <div className="foot-in">
        <div className="grow">
          <div className="eyebrow-dark">Next</div>
          <b className="foot-title">{next.title}</b>
        </div>
        <button className="tap btn primary" onClick={onNext} style={{ background: GA.blue, color: "#fff" }}>
          {requirementActionLabel(next, true)}
        </button>
      </div>
    </div>
  );
}
