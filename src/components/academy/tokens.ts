export const GA = {
  navy: "#0e2249",
  navyD: "#07142e",
  blue: "#2569b8",
  sky: "#9DB8DE",
  paper: "#eef2f7",
  card: "#ffffff",
  ink: "#1a2740",
  mute: "#5a6b82",
  gold: "#f5b716",
  goldD: "#8a5a00",
  line: "#e2e8f0",
  good: "#157a43",
  goodBg: "#E4F4EC",
  warn: "#8a5a00",
  warnBg: "#FDF4E0",
  clay: "#a63a20",
  clayBg: "#FBEAE5",
  olive: "#3f4c37",
  oliveLt: "#EDEFE9",
  brand: "#1f5d99",
  brandD: "#163f66",
  tg: "#1373a2",
  mark: "#0205C6",
} as const;

export const GA_GRADIENT = `linear-gradient(160deg, ${GA.brand}, ${GA.brandD})`;

export const METALS = {
  bronze: { lo: "#8C5A2B", mid: "#B87A3D", hi: "#E2A96A", ink: "#3A2410" },
  silver: { lo: "#7E8A9C", mid: "#B9C4D2", hi: "#EDF1F6", ink: "#0e2249" },
  gold: { lo: "#B07E0A", mid: "#f5b716", hi: "#FFD968", ink: "#3A2A00" },
} as const;

export type Metal = keyof typeof METALS;
