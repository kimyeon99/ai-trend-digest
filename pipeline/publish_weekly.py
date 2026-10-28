"""Select the week's top papers from data/daily/*.json and write data/weekly/YYYY-Www.json."""

import argparse
import math
from collections.abc import Callable
from datetime import date, datetime, timedelta
from pathlib import Path

import anthropic
from pydantic import BaseModel

from collect import collect
from common import DAILY_DIR, JST, WEEKLY_DIR, read_json, write_json
from score import PROFILE_PATH, build_prompt, score_day

# final = relevance (LLM, 0-100) mixed with upvotes (HF, log-normalized to 0-100 within the week)
RELEVANCE_WEIGHT = 0.7
UPVOTE_WEIGHT = 0.3
TOP_N = 5

MODEL = "claude-sonnet-5-5"

SYSTEM_PROMPT = """\
You write a weekly Korean digest of AI papers for one reader, described by the profile.

For each paper:
- `summary`: exactly three short Korean sentences: the problem, the method, the result.
- `practical`: one Korean sentence on how it connects to the reader's work in the profile. If it
  has no practical use, say so plainly.
- `difficulty`: 1 (readable without ML background), 2 (needs basic ML knowledge), 3 (needs
  specialist knowledge).

Also write `headline`: one Korean sentence on what this week's papers have in common.

Use only the title and abstract. Do not add numbers, names, or claims that are not in the
abstract. Return exactly one entry for every paper id given."""


class PaperWriteup(BaseModel):
    id: str
    summary: list[str]
    practical: str
    difficulty: int


class Writeup(BaseModel):
    headline: str
    papers: list[PaperWriteup]


def last_week_jst() -> str:
    year, week, _ = (datetime.now(JST).date() - timedelta(weeks=1)).isocalendar()
    return f"{year}-W{week:02d}"


def week_days(week: str) -> list[date]:
    """Monday to Sunday of an ISO week such as "2026-W45"."""
    year, num = week.split("-W")
    return [date.fromisocalendar(int(year), int(num), weekday) for weekday in range(1, 8)]


def dedupe(items: list[dict]) -> list[dict]:
    """HF can list the same paper on several days. Keep the copy with the most upvotes."""
    by_id: dict[str, dict] = {}
    for item in items:
        kept = by_id.get(item["id"])
        if kept is None or item["signals"]["upvotes"] > kept["signals"]["upvotes"]:
            by_id[item["id"]] = item
    return list(by_id.values())


def rank(items: list[dict]) -> list[dict]:
    """Return copies of items with a `final` score, highest first."""
    max_log = math.log1p(max(item["signals"]["upvotes"] for item in items))
    ranked = []
    for item in items:
        upvote_score = math.log1p(item["signals"]["upvotes"]) / max_log * 100 if max_log else 0
        final = RELEVANCE_WEIGHT * item["score"]["relevance"] + UPVOTE_WEIGHT * upvote_score
        ranked.append({**item, "final": round(final, 1)})
    return sorted(ranked, key=lambda item: item["final"], reverse=True)


def gather(
    week: str,
    daily_dir: Path = DAILY_DIR,
    refresh: Callable[[date], int] = collect,
    score: Callable[[date], int] = score_day,
) -> list[dict]:
    """Refresh upvotes and score pending items for each day, then merge the week."""
    items = []
    for day in week_days(week):
        refresh(day)
        score(day)
        items += read_json(daily_dir / f"{day.isoformat()}.json")["items"]
    return dedupe(items)


def request_writeup(prompt: str) -> Writeup:
    client = anthropic.Anthropic()
    response = client.beta.messages.parse(
        model=MODEL,
        max_tokens=16000,
        output_config={"effort": "high"},
        # on a safety decline, retry on a model the API picks instead of failing the week
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
        output_format=Writeup,
    )
    if response.stop_reason != "end_turn":
        raise RuntimeError(f"Writing stopped early: {response.stop_reason}")
    usage = response.usage
    print(f"tokens: input={usage.input_tokens} output={usage.output_tokens}")
    return response.parsed_output


def build_issue(week: str, collected: int, top: list[dict], writeup: Writeup) -> dict:
    """Combine the selected items with the writeup. Fails unless each item got one valid entry."""
    expected = sorted(item["id"] for item in top)
    returned = sorted(paper.id for paper in writeup.papers)
    if returned != expected:
        raise ValueError(f"Writeup ids do not match items: expected {expected}, got {returned}")
    for paper in writeup.papers:
        if len(paper.summary) != 3 or paper.difficulty not in (1, 2, 3):
            raise ValueError(f"Invalid writeup for {paper.id}: {paper}")

    by_id = {paper.id: paper for paper in writeup.papers}
    days = week_days(week)
    return {
        "week": week,
        "period": {"from": days[0].isoformat(), "to": days[-1].isoformat()},
        "stats": {"collected": collected, "published": len(top)},
        "headline": writeup.headline,
        "papers": [
            {
                "itemId": item["id"],
                "title": item["title"],
                "url": item["url"],
                "summary": by_id[item["id"]].summary,
                "practical": by_id[item["id"]].practical,
                "difficulty": by_id[item["id"]].difficulty,
            }
            for item in top
        ],
    }


def publish(
    week: str,
    items: list[dict],
    weekly_dir: Path = WEEKLY_DIR,
    write: Callable[[str], Writeup] = request_writeup,
) -> dict:
    top = rank(items)[:TOP_N]
    for item in top:
        upvotes = item["signals"]["upvotes"]
        relevance = item["score"]["relevance"]
        print(f"{item['final']:>5}  rel={relevance:>3} up={upvotes:>4}  {item['title'][:60]}")
    profile = PROFILE_PATH.read_text(encoding="utf-8")
    issue = build_issue(week, len(items), top, write(build_prompt(profile, top)))
    write_json(weekly_dir / f"{week}.json", issue)
    return issue


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--week",
        default=last_week_jst(),
        help="ISO week such as 2026-W45 (default: last week in JST)",
    )
    args = parser.parse_args()
    issue = publish(args.week, gather(args.week))
    stats = issue["stats"]
    print(f"{args.week}: collected {stats['collected']} → published {stats['published']}")
    print(issue["headline"])


if __name__ == "__main__":
    main()
