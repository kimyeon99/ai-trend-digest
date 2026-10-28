import json
from datetime import date

import publish_weekly


def make_item(item_id: str, upvotes: int, relevance: int = 50) -> dict:
    return {
        "id": item_id,
        "title": f"title {item_id}",
        "signals": {"upvotes": upvotes},
        "score": {"relevance": relevance, "reason": ""},
    }


def test_week_days_returns_monday_to_sunday():
    days = publish_weekly.week_days("2026-W44")

    assert days[0] == date(2026, 10, 26)
    assert days[-1] == date(2026, 11, 1)
    assert len(days) == 7


def test_dedupe_keeps_copy_with_most_upvotes():
    items = [make_item("a", 3), make_item("b", 1), make_item("a", 9)]

    deduped = publish_weekly.dedupe(items)

    assert [(item["id"], item["signals"]["upvotes"]) for item in deduped] == [("a", 9), ("b", 1)]


def test_rank_mixes_relevance_and_log_upvotes():
    items = [make_item("top-upvotes", 353, 72), make_item("top-relevance", 11, 92)]

    ranked = publish_weekly.rank(items)

    # 0.7*72 + 0.3*100 = 80.4 / 0.7*92 + 0.3*(log 12 / log 354 * 100) = 77.1
    assert [(item["id"], item["final"]) for item in ranked] == [
        ("top-upvotes", 80.4),
        ("top-relevance", 77.1),
    ]


def test_rank_handles_week_without_upvotes():
    ranked = publish_weekly.rank([make_item("a", 0, 60)])

    assert ranked[0]["final"] == 42.0


def test_gather_refreshes_and_scores_every_day(tmp_path):
    days = publish_weekly.week_days("2026-W44")
    for day in days:
        data = {"date": day.isoformat(), "items": [make_item("same", 5)]}
        (tmp_path / f"{day.isoformat()}.json").write_text(json.dumps(data))
    calls = []

    items = publish_weekly.gather(
        "2026-W44",
        daily_dir=tmp_path,
        refresh=lambda day: calls.append(("refresh", day)),
        score=lambda day: calls.append(("score", day)),
    )

    assert calls == [(step, day) for day in days for step in ("refresh", "score")]
    assert [item["id"] for item in items] == ["same"]
