import json
from datetime import date

import pytest

import score
from score import ItemScore


def make_item(item_id: str, **extra) -> dict:
    return {"id": item_id, "title": f"title {item_id}", "text": f"abstract {item_id}", **extra}


def test_apply_scores_writes_score_into_items():
    items = [make_item("a"), make_item("b")]
    scores = [
        ItemScore(id="b", relevance=10, reason="무관"),
        ItemScore(id="a", relevance=90, reason="관련"),
    ]

    score.apply_scores(items, scores)

    assert items[0]["score"] == {"relevance": 90, "reason": "관련"}
    assert items[1]["score"] == {"relevance": 10, "reason": "무관"}


@pytest.mark.parametrize(
    "ids",
    [["a"], ["a", "b", "c"], ["a", "a"]],
    ids=["missing", "extra", "duplicate"],
)
def test_apply_scores_rejects_mismatched_ids(ids):
    items = [make_item("a"), make_item("b")]
    scores = [ItemScore(id=i, relevance=50, reason="") for i in ids]

    with pytest.raises(ValueError):
        score.apply_scores(items, scores)


def test_score_day_scores_only_pending_items(tmp_path):
    scored = make_item("old", score={"relevance": 70, "reason": "기존"})
    data = {"date": "2026-10-26", "items": [scored, make_item("new")]}
    (tmp_path / "2026-10-26.json").write_text(json.dumps(data))
    prompts = []

    def fake_request(prompt):
        prompts.append(prompt)
        return [ItemScore(id="new", relevance=40, reason="새 항목")]

    count = score.score_day(date(2026, 10, 26), daily_dir=tmp_path, request=fake_request)

    items = json.loads((tmp_path / "2026-10-26.json").read_text())["items"]
    assert count == 1
    assert 'id="new"' in prompts[0] and 'id="old"' not in prompts[0]
    assert items[0]["score"]["reason"] == "기존"
    assert items[1]["score"]["reason"] == "새 항목"


def test_score_day_skips_request_when_nothing_pending(tmp_path):
    data = {"date": "2026-10-26", "items": [make_item("a", score={"relevance": 1, "reason": ""})]}
    (tmp_path / "2026-10-26.json").write_text(json.dumps(data))

    def fail_request(prompt):
        raise AssertionError("must not call the API")

    assert score.score_day(date(2026, 10, 26), daily_dir=tmp_path, request=fail_request) == 0
