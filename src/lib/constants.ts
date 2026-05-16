// src/lib/constants.ts

export const MANAGING_DIVISIONS = [
  { id: "IT", label: "IT Infrastructure & Ops" },
  { id: "GA", label: "General Affair" },
  { id: "ASS", label: "After Sales Service" },
  { id: "MKT", label: "Marketing" },
] as const;

export const BRANCHES = [
  "HO - Head Office",
  "Jakarta",
  "Bekasi",
  "Tangerang",
  "Bandung",
  "Semarang",
  "Yogyakarta",
  "Surabaya",
  "Bali",
  "Lampung",
  "Palembang",
  "Pekanbaru",
  "Medan",
  "Pontianak",
  "Samarinda",
  "Makassar",
];

// Biarkan MANAGING_DIVISIONS yang sudah ada di bawahnya...

// Helper type biar TypeScript lu makin sakti
export type DivisionId = (typeof MANAGING_DIVISIONS)[number]["id"];


