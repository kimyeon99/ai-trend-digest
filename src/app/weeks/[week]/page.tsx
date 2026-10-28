import Link from "next/link";
import { notFound } from "next/navigation";

import { IssueView } from "@/components/IssueView";
import { getIssue, listWeeks } from "@/lib/issues";

export async function generateStaticParams() {
  return (await listWeeks()).map((week) => ({ week }));
}

export default async function WeekPage({ params }: PageProps<"/weeks/[week]">) {
  const { week } = await params;
  const issue = await getIssue(week);
  if (!issue) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <Link href="/" className="text-sm underline">
        ← 최신 호
      </Link>
      <IssueView issue={issue} />
    </main>
  );
}
