import json
from datetime import date
from pathlib import Path

import collect

FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "hf_daily.json").read_text())


def test_normalize_maps_hf_entry_to_daily_item():
    item = collect.normalize(FIXTURE[0])
    paper = FIXTURE[0]["paper"]

    assert item["id"] == f"hf-{paper['id']}"
    assert item["track"] == "papers"
    assert item["url"] == f"https://huggingface.co/papers/{paper['id']}"
    assert item["signals"] == {"upvotes": paper["upvotes"]}
    assert "\n" not in item["text"]


def test_merge_refreshes_signals_and_keeps_score():
    old = collect.normalize(FIXTURE[0])
    old["signals"] = {"upvotes": 1}
    old["score"] = {"relevance": 80, "reason": "..."}
    fetched = [collect.normalize(entry) for entry in FIXTURE]

    merged = collect.merge([old], fetched)

    assert [item["id"] for item in merged] == [item["id"] for item in fetched]
    assert merged[0]["signals"] == fetched[0]["signals"]
    assert merged[0]["score"] == {"relevance": 80, "reason": "..."}


def test_collect_writes_daily_file(tmp_path, monkeypatch):
    monkeypatch.setattr(collect, "fetch_daily_papers", lambda day: FIXTURE)

    count = collect.collect(date(2026, 10, 26), daily_dir=tmp_path)
    collect.collect(date(2026, 10, 26), daily_dir=tmp_path)  # rerun must not duplicate

    data = json.loads((tmp_path / "2026-10-26.json").read_text())
    assert count == len(FIXTURE)
    assert data["date"] == "2026-10-26"
    assert len(data["items"]) == len(FIXTURE)
