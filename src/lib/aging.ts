export type AgingBucket = "current" | "due0_30" | "due31_60" | "due61_90" | "due90plus";

export function bucketForDueDate(dueDate: Date, asOf: Date = new Date()): AgingBucket {
  const ms = asOf.getTime() - new Date(dueDate).getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days < 0) return "current";
  if (days <= 30) return "due0_30";
  if (days <= 60) return "due31_60";
  if (days <= 90) return "due61_90";
  return "due90plus";
}

export const bucketLabels: Record<AgingBucket, string> = {
  current: "Not yet due",
  due0_30: "0–30 days",
  due31_60: "31–60 days",
  due61_90: "61–90 days",
  due90plus: "90+ days",
};
