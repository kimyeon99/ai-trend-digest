import Image from "next/image";
import Link from "next/link";

import { IssuePicker } from "@/components/IssuePicker";
import { PaperMeta } from "@/components/PaperMeta";
import { type Issue, type Paper, paperSlug, thumbnailUrl } from "@/lib/issues";

const FEATURED_COUNT = 3;

export function IssueView({ issue, issues }: { issue: Issue; issues: { week: string; label: string }[] }) {
  const featured = issue.papers.slice(0, FEATURED_COUNT);
  const rest = issue.papers.slice(FEATURED_COUNT);

  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <div>
          <IssuePicker issues={issues} current={issue.week} />
        </div>
        <h1 className="text-2xl leading-snug font-bold md:text-3xl">{issue.headline}</h1>
        <p className="text-sm text-muted">
          수집 {issue.stats.collected}건 → 게재 {issue.stats.published}건
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-accent">이번 주 추천 논문</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((paper, i) => (
            <PaperCard
              key={paper.itemId}
              week={issue.week}
              paper={paper}
              rank={i + 1}
              large={i === 0}
              className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
            />
          ))}
        </div>
      </section>

      {rest.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted">더 볼 논문</h2>
          <div className="flex flex-col gap-4">
            {rest.map((paper, i) => (
              <PaperCard key={paper.itemId} week={issue.week} paper={paper} rank={FEATURED_COUNT + i + 1} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

// The whole card opens the paper (as a modal on top of the issue, see app/@modal)
function PaperCard({
  week,
  paper,
  rank,
  large = false,
  className = "",
}: {
  week: string;
  paper: Paper;
  rank: number;
  large?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/weeks/${week}/${paperSlug(paper)}`}
      scroll={false}
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-muted ${className}`}
    >
      {large && (
        <div className="relative aspect-[1200/648] border-b border-border dark:brightness-90">
          <Image
            src={thumbnailUrl(paper)}
            alt=""
            fill
            sizes="(min-width: 768px) 680px, 100vw"
            className="object-cover object-top"
          />
        </div>
      )}
      <div className={`flex flex-col gap-3 ${large ? "p-6" : "p-5"}`}>
        <PaperMeta paper={paper} rank={rank} />
        <h3 className={`leading-snug font-semibold ${large ? "text-xl" : "text-base"}`}>{paper.oneliner}</h3>
        <p className="text-sm text-muted">{paper.title}</p>
      </div>
    </Link>
  );
}
