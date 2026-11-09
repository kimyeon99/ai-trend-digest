import type { Paper } from "@/lib/issues";

export function PaperMeta({ paper, rank }: { paper: Paper; rank: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <span className="rounded-full bg-accent/10 px-2.5 py-1 font-semibold text-accent">{paper.label}</span>
      <span>
        #{rank} · 난이도 {"★".repeat(paper.difficulty)}
        {"☆".repeat(3 - paper.difficulty)}
      </span>
      <span>
        관련도 {paper.selection.relevance} · 추천 {paper.selection.upvotes}
      </span>
    </div>
  );
}
