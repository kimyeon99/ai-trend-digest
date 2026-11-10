"use client";

import { useRouter } from "next/navigation";

import GlideSelect from "@/components/GlideSelect";

// Chip at the top of an issue: shows the current week and switches to another one
export function IssuePicker({ issues, current }: { issues: { week: string; label: string }[]; current: string }) {
  const router = useRouter();

  return (
    <GlideSelect
      options={issues.map((issue, i) => ({ value: issue.week, label: issue.label, tag: i === 0 ? "최신" : undefined }))}
      value={current}
      onChange={(week) => router.push(`/weeks/${week}`)}
      ariaLabel="호 선택"
      menuWidth={260}
      accentColor="var(--accent)"
      surfaceColor="var(--card)"
      highlightColor="var(--border)"
      textColor="var(--foreground)"
      // The chip has the same color as the card, so a thin ring keeps it visible on the page
      className="rounded-md ring-1 ring-border"
    />
  );
}
