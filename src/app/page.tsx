import { IssueView } from "@/components/IssueView";
import { getIssue, listWeeks } from "@/lib/issues";

export default async function Home() {
  const [latest] = await listWeeks();
  const issue = latest ? await getIssue(latest) : null;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      {issue ? <IssueView issue={issue} /> : <p>아직 발행된 호가 없습니다.</p>}
    </main>
  );
}
