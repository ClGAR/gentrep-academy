import type { DashboardData, RankCode, RankRecord, RequirementView } from "@/lib/academy/types";

const ranks: RankRecord[] = [
  {
    id: "base",
    code: "BASE",
    name: "BASE",
    fullName: "Base Activation",
    phase: "Member",
    eyebrow: "Activation",
    pinLabel: "activated",
    opensText: "My Team opens.",
    officerTitle: null,
    abbr: null,
    sortOrder: 1,
    citation:
      "As an activated member of the Gutguard Lifestyle, having completed Admin and Compliance and all five activation events.",
    metal: "bronze",
    insigniaKind: "seal",
    insigniaCount: 0,
  },
  {
    id: "tl",
    code: "TL",
    name: "TL",
    fullName: "Team Leader",
    phase: "Lead Generator",
    eyebrow: "Rank certification",
    pinLabel: "pinned Team Leader",
    opensText: "You'll be invited to a Recognition Night.",
    officerTitle: "Academy Second Lieutenant",
    abbr: "2Lt",
    sortOrder: 2,
    citation: "As an official member of the Gutguard Corps of Officers.",
    metal: "silver",
    insigniaKind: "bars",
    insigniaCount: 1,
  },
  {
    id: "sl",
    code: "SL",
    name: "SL",
    fullName: "Squad Leader",
    phase: "Presenter",
    eyebrow: "Rank certification",
    pinLabel: "pinned Squad Leader",
    opensText: "You'll be invited to a Recognition Night.",
    officerTitle: "Academy First Lieutenant",
    abbr: "1Lt",
    sortOrder: 3,
    citation: "As an official member of the Gutguard Corps of Officers.",
    metal: "silver",
    insigniaKind: "bars",
    insigniaCount: 2,
  },
  {
    id: "pl",
    code: "PL",
    name: "PL",
    fullName: "Platoon Leader",
    phase: "Trains Team Leaders",
    eyebrow: "Rank certification",
    pinLabel: "pinned Platoon Leader",
    opensText: "You'll be invited to a Recognition Night.",
    officerTitle: "Academy Captain",
    abbr: "Capt",
    sortOrder: 4,
    citation: "As an official member of the Gutguard Corps of Officers.",
    metal: "silver",
    insigniaKind: "bars",
    insigniaCount: 3,
  },
  {
    id: "cc",
    code: "CC",
    name: "CC",
    fullName: "Company Commander",
    phase: "Trains Squad Leaders",
    eyebrow: "Rank certification",
    pinLabel: "pinned Company Commander",
    opensText: "You'll be invited to a Recognition Night.",
    officerTitle: "Academy Major",
    abbr: "Maj",
    sortOrder: 5,
    citation: "As an official member of the Gutguard Corps of Officers.",
    metal: "gold",
    insigniaKind: "field",
    insigniaCount: 1,
  },
];

function req(
  rankId: string,
  id: string,
  type: RequirementView["type"],
  title: string,
  status: RequirementView["status"],
  helper: string,
  extra: Partial<RequirementView> = {},
): RequirementView {
  return {
    id,
    rankId,
    code: id,
    type,
    title,
    note: extra.note ?? helper,
    minutes: type === "document" ? extra.minutes ?? "2 min" : extra.minutes ?? null,
    sortOrder: 0,
    documentId: type === "document" ? id : null,
    status,
    helper,
    completedAt: status === "done" ? "2026-07-28T00:00:00+08:00" : null,
    source: status === "done" ? type : null,
    bookedEvent: null,
    bookingId: null,
    matchingEvents: [],
    ...extra,
  };
}

const baseRequirements: RequirementView[] = [
  req("base", "b-orient", "document", "Gutguard Dashboard Orientation", "done", "Agreed · 28 Jul", { minutes: "4 min" }),
  req("base", "b-da", "document", "Distributor's Agreement", "done", "Agreed · 28 Jul", { minutes: "6 min" }),
  req("base", "b-eth", "document", "Code of Ethics", "done", "Agreed sa Tagalog · 28 Jul", { minutes: "5 min" }),
  req("base", "b-creed", "document", "Gentrep Creed", "open", "Video 2 min · then read and agree", { minutes: "2 min" }),
  req("base", "b-1", "attendance", "Ginhawa Talk", "done", "Attended · 19 Jul", { note: "Where it starts" }),
  req("base", "b-2", "attendance", "Product Presentation", "missed", "Missed · 26 Jul — pick another date", {
    note: "What it is, how to use it",
  }),
  req("base", "b-3", "attendance", "Testimonial Session", "booked", "Booked · Sat 2 Aug, Robinsons, Davao", {
    note: "Real members, real results",
  }),
  req("base", "b-4", "attendance", "Business Orientation", "open", "3 dates posted", { note: "How earning actually works" }),
  req("base", "b-5", "attendance", "Leaders' Training", "open", "2 dates posted", { note: "Running your own table" }),
];

export const fixtureRequirementsByRank: Record<RankCode, RequirementView[]> = {
  BASE: baseRequirements,
  TL: [
    req("tl", "t-1", "attendance", "Your First Twenty Names", "open", "No dates posted yet", {
      note: "Where leads actually come from",
    }),
    req("tl", "t-2", "attendance", "The Invite Conversation", "open", "No dates posted yet", {
      note: "Asking without pressure",
    }),
    req("tl", "t-3", "attendance", "Following Up", "open", "No dates posted yet", { note: "Staying in touch, not chasing" }),
    req("tl", "t-4", "attendance", "Handling a Guest", "open", "No dates posted yet", {
      note: "From the door to the seat",
    }),
    req("tl", "t-5", "attendance", "What You May Not Say", "open", "No dates posted yet", {
      note: "Claims, income, and the line",
    }),
    req("tl", "t-demo", "demonstration", "Bring three guests", "open", "They check in, with a Platoon Leader in the room", {
      note: "They check in, with a Platoon Leader in the room",
    }),
  ],
  SL: [
    req("sl", "s-1", "attendance", "Opening a Room", "open", "No dates posted yet", { note: "The first four minutes" }),
    req("sl", "s-2", "attendance", "The Product Story", "open", "No dates posted yet", { note: "What it is, without claims" }),
    req("sl", "s-3", "attendance", "Handling Questions", "open", "No dates posted yet", { note: "Including the hard ones" }),
    req("sl", "s-4", "attendance", "Closing the Session", "open", "No dates posted yet", {
      note: "Asking, and letting people choose",
    }),
    req("sl", "s-demo", "demonstration", "Present a full session", "open", "With a Platoon Leader watching", {
      note: "With a Platoon Leader watching",
    }),
  ],
  PL: [
    req("pl", "p-1", "attendance", "Teaching, Not Telling", "open", "No dates posted yet", { note: "How adults actually learn" }),
    req("pl", "p-2", "attendance", "Running a Class", "open", "No dates posted yet", { note: "Structure, pace, and the room" }),
    req("pl", "p-3", "attendance", "Signing Someone Off", "open", "No dates posted yet", { note: "What you are vouching for" }),
    req("pl", "p-der", "derived", "A Team Leader you trained is certified", "open", "Their certificate, not your word", {
      note: "Their certificate, not your word",
    }),
  ],
  CC: [
    req("cc", "c-1", "attendance", "Building a Bench", "open", "No dates posted yet", { note: "Depth, not headcount" }),
    req("cc", "c-2", "attendance", "Standards and Drift", "open", "No dates posted yet", { note: "Keeping the teaching true" }),
    req("cc", "c-der", "derived", "A Squad Leader you trained is certified", "open", "Their certificate, not your word", {
      note: "Their certificate, not your word",
    }),
  ],
};

export function cloneWalkCatalog(): Record<RankCode, RequirementView[]> {
  return {
    BASE: fixtureRequirementsByRank.BASE.map((item) => ({ ...item, matchingEvents: [...item.matchingEvents] })),
    TL: fixtureRequirementsByRank.TL.map((item) => ({ ...item, matchingEvents: [...item.matchingEvents] })),
    SL: fixtureRequirementsByRank.SL.map((item) => ({ ...item, matchingEvents: [...item.matchingEvents] })),
    PL: fixtureRequirementsByRank.PL.map((item) => ({ ...item, matchingEvents: [...item.matchingEvents] })),
    CC: fixtureRequirementsByRank.CC.map((item) => ({ ...item, matchingEvents: [...item.matchingEvents] })),
  };
}

export const chairmanVisualFixture: DashboardData = {
  profile: {
    id: "visual-fixture",
    fullName: "Rey Aquino",
    teamName: "Team Bravo",
    teamTelegramUrl: "https://t.me/",
    teamMemberCount: 24,
    memberCard: "0240 5578 9012 3456",
    currentRankCode: "BASE",
    roles: ["member"],
  },
  ranks,
  selectedRank: ranks[0],
  requirements: fixtureRequirementsByRank.BASE,
  documents: [
    {
      id: "b-creed",
      slug: "creed",
      title: "Gentrep Creed",
      titleTl: "Ang Gentrep Creed",
      version: "The Creed",
      minutes: "2 min",
      blurb: "What we hold ourselves to.",
      blurbTl: "Ang pinanghahawakan natin sa sarili.",
      body: "I earn, I do not extract.",
      bodyTl: "Kumikita ako, hindi ako nangungurakot.",
    },
  ],
  rankProgress: [
    {
      rankId: "base",
      rankCode: "BASE",
      status: "in_progress",
      completedAt: null,
    },
  ],
  certificates: [],
  lockedReason: null,
};
