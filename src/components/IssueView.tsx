import type { Issue, Paper } from "@/lib/issues";

export function IssueView({ issue }: { issue: Issue }) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-zinc-500">
          {issue.week} ({issue.period.from} ~ {issue.period.to})
        </p>
        <h1 className="text-2xl font-semibold">{issue.headline}</h1>
        <p className="text-sm text-zinc-500">
          수집 {issue.stats.collected}건 → 게재 {issue.stats.published}건
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">📄 Papers</h2>
        {issue.papers.map((paper) => (
          <PaperItem key={paper.itemId} paper={paper} />
        ))}
      </section>
    </article>
  );
}

function PaperItem({ paper }: { paper: Paper }) {
  return (
    <div className="flex flex-col gap-2">
      <a href={paper.url} className="font-medium underline" target="_blank" rel="noopener noreferrer">
        {paper.title}
      </a>
      <ul className="list-disc pl-5">
        {paper.summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p>실무 연결: {paper.practical}</p>
      <p className="text-sm text-zinc-500">
        난이도 {"★".repeat(paper.difficulty)}
        {"☆".repeat(3 - paper.difficulty)}
      </p>
    </div>
  );
}
