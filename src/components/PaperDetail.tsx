import Image from "next/image";

import { PaperMeta } from "@/components/PaperMeta";
import { type Paper, thumbnailUrl } from "@/lib/issues";

const SECTIONS = ["어떤 문제인가", "어떻게 풀었나", "결과"];

// Shared by the modal (app/@modal) and the full page (app/weeks/[week]/[paper])
export function PaperDetail({ paper, rank }: { paper: Paper; rank: number }) {
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <PaperMeta paper={paper} rank={rank} />
        <h1 className="text-xl leading-snug font-bold md:text-2xl">{paper.oneliner}</h1>
        <p className="text-sm text-muted">{paper.title}</p>
      </header>

      <div className="relative aspect-[1200/648] overflow-hidden rounded-xl border border-border dark:brightness-90">
        <Image
          src={thumbnailUrl(paper)}
          alt=""
          fill
          sizes="(min-width: 768px) 720px, 100vw"
          className="object-cover object-top"
        />
      </div>

      {paper.summary.map((line, i) => (
        <section key={line} className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-muted">{SECTIONS[i]}</h2>
          <p className="leading-relaxed">{line}</p>
        </section>
      ))}

      <section className="flex flex-col gap-1 rounded-lg bg-accent/8 px-4 py-3">
        <h2 className="text-sm font-semibold text-accent">왜 중요한가</h2>
        <p className="leading-relaxed">{paper.practical}</p>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-muted">왜 골랐나</h2>
        <p className="leading-relaxed">{paper.selection.reason}</p>
        <p className="text-sm text-muted">
          최종 {paper.selection.final}점 = 관련도 {paper.selection.relevance} × 0.7 + 추천 {paper.selection.upvotes}
          개(주간 최댓값 기준 환산) × 0.3
        </p>
      </section>

      {paper.terms.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">용어 풀이</h2>
          <dl className="flex flex-col gap-2 text-sm leading-relaxed">
            {paper.terms.map(({ term, meaning }) => (
              <div key={term}>
                <dt className="inline font-semibold">{term}</dt>
                <dd className="inline"> — {meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-semibold text-muted">초록 원문 (영문)</summary>
        <p className="mt-2 leading-relaxed whitespace-pre-line text-muted">{paper.abstract}</p>
      </details>

      <a
        href={paper.url}
        target="_blank"
        rel="noopener noreferrer"
        className="self-end text-sm text-muted underline underline-offset-4 hover:text-foreground"
      >
        원문 보기 ↗
      </a>
    </article>
  );
}
