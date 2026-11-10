import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { cacheLife } from "next/cache";

// Written by pipeline/publish_weekly.py (format: PLAN.md section 5)
const WEEKLY_DIR = path.join(process.cwd(), "data", "weekly");

export type Paper = {
  itemId: string;
  title: string;
  url: string;
  oneliner: string;
  // problem, method, result
  summary: string[];
  practical: string;
  difficulty: 1 | 2 | 3;
  label: string;
  terms: { term: string; meaning: string }[];
  abstract: string;
  // final = 0.7 * relevance (LLM, 0-100) + 0.3 * upvotes (log-normalized within the week)
  selection: { final: number; relevance: number; upvotes: number; reason: string };
};

export type Issue = {
  week: string;
  period: { from: string; to: string };
  stats: { collected: number; published: number };
  headline: string;
  papers: Paper[];
};

/** Published weeks, newest first ("2026-W43" sorts correctly as a string). */
export async function listWeeks(): Promise<string[]> {
  "use cache";
  // data/ only changes with a new commit, and every commit triggers a rebuild
  cacheLife("max");
  const files = await readdir(WEEKLY_DIR);
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort()
    .reverse();
}

/** Returns null for a week that was never published. */
export async function getIssue(week: string): Promise<Issue | null> {
  "use cache";
  cacheLife("max");
  // Checking against the list also keeps arbitrary input out of the file path
  if (!(await listWeeks()).includes(week)) return null;
  return JSON.parse(await readFile(path.join(WEEKLY_DIR, `${week}.json`), "utf-8"));
}

/** Every published week with its label, newest first (for the issue pickers). */
export async function listIssueSummaries(): Promise<{ week: string; label: string; month: string }[]> {
  const issues = await Promise.all((await listWeeks()).map(getIssue));
  return issues.filter((issue) => issue !== null).map((issue) => ({
    week: issue.week,
    label: weekLabel(issue),
    month: issueMonth(issue),
  }));
}

/** "2026-W44 · 10/26 ~ 11/01" */
export function weekLabel(issue: Issue): string {
  const day = (date: string) => date.slice(5).replace("-", "/");
  return `${issue.week} · ${day(issue.period.from)} ~ ${day(issue.period.to)}`;
}

// An ISO week belongs to the month of its Thursday (Monday + 3 days)
function issueMonth(issue: Issue): string {
  const thursday = new Date(`${issue.period.from}T00:00:00Z`);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  return `${thursday.getUTCFullYear()}년 ${thursday.getUTCMonth() + 1}월`;
}

/** The paper's part of the URL: its arXiv id ("hf-2610.37230" → "2610.37230"). */
export function paperSlug(paper: Paper): string {
  return paper.itemId.replace(/^hf-/, "");
}

// Hugging Face publishes a screenshot of each paper's first page under its arXiv id
export function thumbnailUrl(paper: Paper): string {
  return `https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${paperSlug(paper)}.png`;
}

/** Returns null for a paper that is not in that week's issue. */
export async function getPaper(week: string, slug: string): Promise<{ paper: Paper; rank: number } | null> {
  const papers = (await getIssue(week))?.papers ?? [];
  const index = papers.findIndex((paper) => paperSlug(paper) === slug);
  return index === -1 ? null : { paper: papers[index], rank: index + 1 };
}

/** Every published paper, for generateStaticParams. */
export async function listPaperParams(): Promise<{ week: string; paper: string }[]> {
  const params = [];
  for (const week of await listWeeks()) {
    for (const paper of (await getIssue(week))!.papers) {
      params.push({ week, paper: paperSlug(paper) });
    }
  }
  return params;
}
