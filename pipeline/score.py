"""Score unscored items in data/daily/YYYY-MM-DD.json against profile.yaml."""

import argparse
from collections.abc import Callable
from datetime import date
from pathlib import Path

import anthropic
from pydantic import BaseModel

from common import DAILY_DIR, REPO_ROOT, read_json, write_json, yesterday_jst

MODEL = "claude-haiku-5-5"
PROFILE_PATH = REPO_ROOT / "profile.yaml"

SYSTEM_PROMPT = """\
You rate how relevant AI papers are to one reader, described by the profile.

Score each paper from 0 to 100:
- 80-100: directly matches an item under `interests`
- 50-79: matches an item under `curious`, or is close to an `interests` item
- 20-49: loosely related to the profile
- 0-19: unrelated, or matches an item under `exclude`

Judge only from the title and abstract. Return exactly one score for every paper id given.
Write `reason` as one short Korean sentence that names the profile item it matches, or why it
does not match."""


class ItemScore(BaseModel):
    id: str
    relevance: int
    reason: str


class ScoreList(BaseModel):
    scores: list[ItemScore]


def build_prompt(profile: str, items: list[dict]) -> str:
    papers = "\n".join(
        f'<paper id="{item["id"]}">\n<title>{item["title"]}</title>\n'
        f"<abstract>{item['text']}</abstract>\n</paper>"
        for item in items
    )
    return f"<profile>\n{profile}</profile>\n\n<papers>\n{papers}\n</papers>"


def request_scores(prompt: str) -> list[ItemScore]:
    client = anthropic.Anthropic()
    response = client.messages.parse(
        model=MODEL,
        max_tokens=16000,
        output_config={"effort": "low"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
        output_format=ScoreList,
    )
    if response.stop_reason != "end_turn":
        raise RuntimeError(f"Scoring stopped early: {response.stop_reason}")
    usage = response.usage
    print(f"tokens: input={usage.input_tokens} output={usage.output_tokens}")
    return response.parsed_output.scores


def apply_scores(items: list[dict], scores: list[ItemScore]) -> None:
    """Write each score into its item. Fails unless every item got exactly one score."""
    expected = sorted(item["id"] for item in items)
    returned = sorted(score.id for score in scores)
    if returned != expected:
        raise ValueError(f"Score ids do not match items: expected {expected}, got {returned}")

    by_id = {score.id: score for score in scores}
    for item in items:
        score = by_id[item["id"]]
        item["score"] = {"relevance": score.relevance, "reason": score.reason}


def score_day(
    day: date,
    daily_dir: Path = DAILY_DIR,
    request: Callable[[str], list[ItemScore]] = request_scores,
) -> int:
    path = daily_dir / f"{day.isoformat()}.json"
    data = read_json(path)
    pending = [item for item in data["items"] if "score" not in item]
    if not pending:
        return 0

    profile = PROFILE_PATH.read_text(encoding="utf-8")
    apply_scores(pending, request(build_prompt(profile, pending)))
    write_json(path, data)
    return len(pending)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--date",
        type=date.fromisoformat,
        default=yesterday_jst(),
        help="day to score (default: yesterday in JST)",
    )
    args = parser.parse_args()
    count = score_day(args.date)
    print(f"{args.date}: scored {count} items")


if __name__ == "__main__":
    main()
