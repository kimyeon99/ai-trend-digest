import json
from datetime import date

import pytest

import publish_weekly
from publish_weekly import PaperWriteup, Writeup


def make_item(item_id: str, upvotes: int, relevance: int = 50) -> dict:
    return {
        "id": item_id,
        "title": f"title {item_id}",
        "url": f"https://example.com/{item_id}",
        "text": f"abstract {item_id}",
        "signals": {"upvotes": upvotes},
        "score": {"relevance": relevance, "reason": ""},
    }


def make_writeup(ids: list[str], summary_lines: int = 3, difficulty: int = 2) -> Writeup:
    return Writeup(
        headline="이번 주 요약",
        papers=[
            PaperWriteup(
                id=i,
                summary=[f"{i} 요약 {n}" for n in range(summary_lines)],
                practical=f"{i} 실무 연결",
                difficulty=difficulty,
            )
            for i in ids
        ],
    )


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


def test_build_issue_follows_top_order_and_weekly_format():
    top = [make_item("b", 9), make_item("a", 1)]

    issue = publish_weekly.build_issue("2026-W44", 40, top, make_writeup(["a", "b"]))

    assert issue["period"] == {"from": "2026-10-26", "to": "2026-11-01"}
    assert issue["stats"] == {"collected": 40, "published": 2}
    assert issue["headline"] == "이번 주 요약"
    assert [paper["itemId"] for paper in issue["papers"]] == ["b", "a"]
    assert issue["papers"][0] == {
        "itemId": "b",
        "title": "title b",
        "url": "https://example.com/b",
        "summary": ["b 요약 0", "b 요약 1", "b 요약 2"],
        "practical": "b 실무 연결",
        "difficulty": 2,
    }


@pytest.mark.parametrize(
    "writeup",
    [
        make_writeup(["a"]),
        make_writeup(["a", "b", "c"]),
        make_writeup(["a", "b"], summary_lines=2),
        make_writeup(["a", "b"], difficulty=4),
    ],
    ids=["missing", "extra", "two-line-summary", "difficulty-out-of-range"],
)
def test_build_issue_rejects_invalid_writeup(writeup):
    top = [make_item("a", 1), make_item("b", 1)]

    with pytest.raises(ValueError):
        publish_weekly.build_issue("2026-W44", 2, top, writeup)


def test_publish_sends_only_top_items_and_writes_file(tmp_path):
    items = [make_item(f"p{n}", upvotes=n, relevance=n * 10) for n in range(1, 8)]
    prompts = []

    def fake_write(prompt):
        prompts.append(prompt)
        return make_writeup([f"p{n}" for n in range(3, 8)])

    publish_weekly.publish("2026-W44", items, weekly_dir=tmp_path, write=fake_write)

    saved = json.loads((tmp_path / "2026-W44.json").read_text(encoding="utf-8"))
    assert saved["stats"] == {"collected": 7, "published": 5}
    assert [paper["itemId"] for paper in saved["papers"]] == ["p7", "p6", "p5", "p4", "p3"]
    assert 'id="p3"' in prompts[0] and 'id="p2"' not in prompts[0]
