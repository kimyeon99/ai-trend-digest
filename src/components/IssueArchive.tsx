"use client";

import { useRouter } from "next/navigation";

import BranchedMenu, { type BranchedMenuItem } from "@/components/BranchedMenu";

// Every issue grouped by month; the current one is traced from the trunk
export function IssueArchive({
  issues,
  current,
}: {
  issues: { week: string; label: string; month: string }[];
  current: string;
}) {
  const router = useRouter();

  // issues come newest first, so the months do too
  const months: BranchedMenuItem[] = [];
  for (const issue of issues) {
    let month = months.find((m) => m.label === issue.month);
    if (!month) {
      month = { label: issue.month, children: [] };
      months.push(month);
    }
    month.children!.push({ value: issue.week, label: issue.label });
  }

  return (
    <BranchedMenu
      items={months}
      defaultOpen={months.findIndex((m) => m.children!.some((c) => c.value === current))}
      defaultActive={current}
      onSelect={(week) => router.push(`/weeks/${week}`)}
      width={320}
      color="var(--foreground)"
      accentColor="var(--accent)"
      lineColor="var(--border)"
    />
  );
}
