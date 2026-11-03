import Image from "next/image";

import type { Issue, Paper } from "@/lib/issues";

const FEATURED_COUNT = 3;

// Hugging Face publishes a screenshot of each paper's first page under its arXiv id
function thumbnailUrl(itemId: string) {
  return `https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${itemId.replace(/^hf-/, "")}.png`;
}

export function IssueView({ issue }: { issue: Issue }) {
  const featured = issue.papers.slice(0, FEATURED_COUNT);
  const rest = issue.papers.slice(FEATURED_COUNT);

  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          {issue.week} · {issue.period.from} ~ {issue.period.to}
        </p>
        <h1 className="text-2xl leading-snug font-bold md:text-3xl">{issue.headline}</h1>
        <p className="text-sm text-muted">
          수집 {issue.stats.collected}건 → 게재 {issue.stats.published}건
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-accent">이번 주 추천 논문</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((paper, i) => (
            <div
              key={paper.itemId}
              className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              {i === 0 && (
                <div className="relative aspect-[1200/648] border-b border-border dark:brightness-90">
                  <Image
                    src={thumbnailUrl(paper.itemId)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 680px, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              )}
              <PaperBody paper={paper} rank={i + 1} large={i === 0} />
            </div>
          ))}
        </div>
      </section>

      {rest.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted">더 볼 논문</h2>
          <div className="flex flex-col gap-4">
            {rest.map((paper, i) => (
              <div key={paper.itemId} className="rounded-2xl border border-border bg-card">
                <PaperBody paper={paper} rank={FEATURED_COUNT + i + 1} />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function PaperBody({ paper, rank, large = false }: { paper: Paper; rank: number; large?: boolean }) {
  return (
    <div className={`flex flex-1 flex-col gap-3 ${large ? "p-6" : "p-5"}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        {paper.label && (
          <span className="rounded-full bg-accent/10 px-2.5 py-1 font-semibold text-accent">{paper.label}</span>
        )}
        <span>
          #{rank} · 난이도 {"★".repeat(paper.difficulty)}
          {"☆".repeat(3 - paper.difficulty)}
        </span>
      </div>
      <h3 className={`leading-snug font-semibold ${large ? "text-xl" : "text-base"}`}>{paper.title}</h3>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
        {paper.summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="rounded-lg bg-accent/8 px-3 py-2 text-sm leading-relaxed">
        <span className="font-semibold text-accent">왜 중요한가</span> {paper.practical}
      </p>
      <a
        href={paper.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto self-end text-sm text-muted underline underline-offset-4 hover:text-foreground"
      >
        원문 보기 ↗
      </a>
    </div>
  );
}
