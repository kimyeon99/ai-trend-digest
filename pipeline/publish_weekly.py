"""Select the week's top papers from data/daily/*.json."""

import argparse
import math
from collections.abc import Callable
from datetime import date, datetime, timedelta
from pathlib import Path

from collect import collect
from common import DAILY_DIR, JST, read_json
from score import score_day

# final = relevance (LLM, 0-100) mixed with upvotes (HF, log-normalized to 0-100 within the week)
RELEVANCE_WEIGHT = 0.7
UPVOTE_WEIGHT = 0.3
TOP_N = 5


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


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--week",
        default=last_week_jst(),
        help="ISO week such as 2026-W45 (default: last week in JST)",
    )
    args = parser.parse_args()
    items = gather(args.week)
    top = rank(items)[:TOP_N]
    print(f"{args.week}: collected {len(items)} → published {len(top)}")
    for item in top:
        upvotes = item["signals"]["upvotes"]
        relevance = item["score"]["relevance"]
        print(f"{item['final']:>5}  rel={relevance:>3} up={upvotes:>4}  {item['title'][:60]}")


if __name__ == "__main__":
    main()
