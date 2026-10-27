"""Collect one day of Hugging Face Daily Papers into data/daily/YYYY-MM-DD.json."""

import argparse
from datetime import date
from pathlib import Path

import httpx

from common import DAILY_DIR, read_json, write_json, yesterday_jst

HF_DAILY_PAPERS_URL = "https://huggingface.co/api/daily_papers"


def fetch_daily_papers(day: date) -> list[dict]:
    resp = httpx.get(HF_DAILY_PAPERS_URL, params={"date": day.isoformat()}, timeout=30)
    resp.raise_for_status()
    return resp.json()


def normalize(entry: dict) -> dict:
    paper = entry["paper"]
    return {
        "id": f"hf-{paper['id']}",
        "track": "papers",
        "source": "hf-daily-papers",
        # HF titles and abstracts contain hard line breaks
        "title": " ".join(paper["title"].split()),
        "url": f"https://huggingface.co/papers/{paper['id']}",
        "publishedAt": paper["publishedAt"],
        "text": " ".join(paper["summary"].split()),
        "signals": {"upvotes": paper.get("upvotes", 0)},
    }


def merge(existing: list[dict], fetched: list[dict]) -> list[dict]:
    """Add new items and refresh signals of known ones, keeping their scores."""
    by_id = {item["id"]: item for item in existing}
    for item in fetched:
        if item["id"] in by_id:
            by_id[item["id"]]["signals"] = item["signals"]
        else:
            by_id[item["id"]] = item
    return list(by_id.values())


def collect(day: date, daily_dir: Path = DAILY_DIR) -> int:
    path = daily_dir / f"{day.isoformat()}.json"
    existing = read_json(path)["items"] if path.exists() else []
    fetched = [normalize(entry) for entry in fetch_daily_papers(day)]
    items = merge(existing, fetched)
    write_json(path, {"date": day.isoformat(), "items": items})
    return len(items)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--date",
        type=date.fromisoformat,
        default=yesterday_jst(),
        help="day to collect (default: yesterday in JST)",
    )
    args = parser.parse_args()
    count = collect(args.date)
    print(f"{args.date}: {count} items")


if __name__ == "__main__":
    main()
