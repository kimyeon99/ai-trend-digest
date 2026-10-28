import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { cacheLife } from "next/cache";

// Written by pipeline/publish_weekly.py (format: PLAN.md section 5)
const WEEKLY_DIR = path.join(process.cwd(), "data", "weekly");

export type Paper = {
  itemId: string;
  title: string;
  url: string;
  summary: string[];
  practical: string;
  difficulty: 1 | 2 | 3;
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
