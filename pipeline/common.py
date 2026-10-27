"""Paths, JSON I/O, and date helpers shared by the pipeline scripts."""

import json
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DAILY_DIR = REPO_ROOT / "data" / "daily"
WEEKLY_DIR = REPO_ROOT / "data" / "weekly"

JST = timezone(timedelta(hours=9))


def yesterday_jst() -> date:
    return datetime.now(JST).date() - timedelta(days=1)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
