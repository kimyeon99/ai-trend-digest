import Link from "next/link";

import { IssueView } from "@/components/IssueView";
import { getIssue, listWeeks } from "@/lib/issues";

export default async function Home() {
  const [latest, ...past] = await listWeeks();
  const issue = latest ? await getIssue(latest) : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 py-12">
      {issue ? <IssueView issue={issue} /> : <p>아직 발행된 호가 없습니다.</p>}

      {past.length > 0 && (
        <nav className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">지난 호</h2>
          <ul>
            {past.map((week) => (
              <li key={week}>
                <Link href={`/weeks/${week}`} className="underline">
                  {week}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </main>
  );
}
