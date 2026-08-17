export const GA = {
  navy: "#0F0F18",
  navyD: "#04067A",
  blue: "#0608A9",
  sky: "#C9AC7E",
  paper: "#F4F1EA",
  card: "#FCFAF5",
  ink: "#0F0F18",
  mute: "#6B6B7A",
  gold: "#B08D5B",
  goldD: "#3A3A48",
  line: "#D8D2C2",
  good: "#1A7A49",
  goodBg: "#E7F2EA",
  warn: "#3A3A48",
  warnBg: "#EBE7DE",
  clay: "#B0202E",
  clayBg: "#F7EDEF",
  olive: "#3A3A48",
  oliveLt: "#EBE7DE",
  brand: "#0608A9",
  brandD: "#04067A",
  tg: "#1373a2",
  mark: "#0608A9",
} as const;

export const GA_GRADIENT = `linear-gradient(160deg, ${GA.brand}, ${GA.brandD})`;

export const METALS = {
  bronze: { lo: "#8C5A2B", mid: "#B87A3D", hi: "#E2A96A", ink: "#3A2410" },
  silver: { lo: "#7E8A9C", mid: "#B9C4D2", hi: "#EDF1F6", ink: "#0F0F18" },
  gold: { lo: "#8A6A3D", mid: "#B08D5B", hi: "#C9AC7E", ink: "#3A2A00" },
} as const;

export type Metal = keyof typeof METALS;
