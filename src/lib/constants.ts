// src/lib/constants.ts

export const MANAGING_DIVISIONS = [
  { id: "IT", label: "IT Infrastructure & Ops" },
  { id: "GA", label: "General Affair" },
  { id: "HR", label: "Human Resources" },
  { id: "FINANCE", label: "Finance & Accounting" },
] as const;

// Helper type biar TypeScript lu makin sakti
export type DivisionId = (typeof MANAGING_DIVISIONS)[number]["id"];