// src/lib/constants.ts

export const MANAGING_DIVISIONS = [
  { id: "IT", label: "IT Infrastructure & Ops" },
  { id: "GA", label: "General Affair" },
  { id: "HR", label: "Human Resources" },
  { id: "FINANCE", label: "Finance & Accounting" },
] as const;

export const BRANCHES = [
  "HO - Head Office",
  "Cabang Jakarta",
  "Cabang Bekasi",
  "Cabang Tangerang",
  "Cabang Bogor",
  "Cabang Bandung",
  "Cabang Semarang",
  "Cabang Yogyakarta",
  "Cabang Surabaya",
  "Cabang Malang",
  "Cabang Bali",
  "Cabang Medan",
  "Cabang Palembang",
  "Cabang Pekanbaru",
  "Cabang Makassar"
];

// Biarkan MANAGING_DIVISIONS yang sudah ada di bawahnya...

// Helper type biar TypeScript lu makin sakti
export type DivisionId = (typeof MANAGING_DIVISIONS)[number]["id"];


