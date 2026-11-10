import { IssueArchive } from "@/components/IssueArchive";
import { IssueView } from "@/components/IssueView";
import { getIssue, listIssueSummaries } from "@/lib/issues";

export default async function Home() {
  const issues = await listIssueSummaries();
  const issue = issues[0] ? await getIssue(issues[0].week) : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12">
      {issue ? <IssueView issue={issue} issues={issues} /> : <p>아직 발행된 호가 없습니다.</p>}

      {issue && issues.length > 1 && (
        <nav id="past" className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">지난 호</h2>
          <IssueArchive issues={issues} current={issue.week} />
        </nav>
      )}
    </main>
  );
}
