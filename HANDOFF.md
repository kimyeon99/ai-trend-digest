# ai-trend-digest 인수인계 (2026-10-28 기준)

새 세션에서 이 저장소를 이어서 작업할 때 읽는 문서다. 먼저 PLAN.md를 읽고, 아래 내용을 따른다.

## 작업 방식 (꼭 지킬 것)
- 항상 한국어로 답한다.
- 한 번에 한 단계(커밋 단위)씩만 진행한다. 코드를 쓰기 전에 "무엇을, 왜"를 쉬운 말로 설명하고 내 동의를 받는다. 구현한 뒤에는 내가 직접 확인할 방법을 알려 주고 멈춘다. 이전에 설명 없이 여러 단계를 몰아서 했다가 내가 이해하지 못한 적이 있다. 포트폴리오 프로젝트라서 내가 면접에서 설명할 수 있어야 한다.
- 용어는 처음 나올 때 한 줄로 풀어 쓴다.
- 파일을 수정한 답변 끝에는 추천 커밋 메시지를 붙인다. prefix(feat:/fix:/docs:/chore:)는 영어, 본문은 한국어로 쓴다. 예: `feat: 매일 논문을 수집하는 워크플로 추가`
- 이 기억들은 새 PC의 메모리에도 저장해 둔다.

## 현재 상태 (M1 Papers 트랙 진행 중, 1호 발행 목표 11/9 월)
완료 (모두 main에 push됨):
- Next.js 16.4 + TS + Tailwind 스캐폴드 (아직 기본 페이지). 배포는 Vercel 먼저 하고 AWS 이전은 나중으로 미룸(PLAN 9·11절)
- `pipeline/` (Python 3.13, uv): `common.py`, `collect.py`(HF Daily Papers API → `data/daily/YYYY-MM-DD.json`, `--date`로 백필 가능, 재실행 시 추천 수만 갱신), `score.py`(claude-haiku-5-5, effort low, 하루치를 한 번에 채점, `messages.parse` 구조화 출력, id 검증, 점수 없는 항목만 채점), pytest 9개
- `profile.yaml`: interests를 frontend/backend/ai_agent로 나누고, exclude에 물리 세계 에이전트 추가
- `.github/workflows/daily.yml`: 매일 21:00 UTC에 수집하고 봇이 커밋 (정상 동작 확인. 아직 채점은 안 함)
- `.github/workflows/score-preview.yml`: 수동 실행 전용. 지정한 날짜를 채점해서 로그로만 출력하고 커밋하지 않음 (profile 튜닝용)
- GitHub Secrets에 `ANTHROPIC_API_KEY` 등록, 월 한도 설정 완료. **로컬 PC에는 키를 두지 않는다**(내가 원하지 않음). LLM 실행 확인은 score-preview로 한다.

## 결정 대기 중
frontend 항목을 넓힐지 정해야 한다. profile을 바꾼 뒤 IQuest-Q1(코딩 CLI 에이전트) 점수가 62에서 55로 내려가 상위 5에서 빠졌다. 원인은 backend 항목이 5개라 가중치가 기울었고, "프론트엔드 개발에 쓰는"이라는 표현이 범위를 좁혔기 때문으로 본다.
- 추천안 B: `프론트엔드 개발에 쓰는 AI 도구 (코딩 에이전트, IDE 통합)` → `AI 코딩 도구 (코딩 에이전트, CLI, IDE 통합)`

## 다음 단계 (순서대로)
1. 위 결정 반영 → score-preview로 2026-10-26을 재실행해 비교
2. `daily.yml`에 Score 단계 추가 (`ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}`). Commit 단계에 `if: ${{ !cancelled() }}`를 붙여, 채점이 실패해도 수집 데이터는 저장
3. `pipeline/publish_weekly.py`: 그 주 7일치 upvotes 재수집 → 미채점 항목 채점 → `final = 0.7*relevance + 0.3*upvote_score`(그 주 안에서 log 정규화한 0~100) → Top 5 → claude-sonnet-5-5로 headline과 논문별 3줄 요약·실무 연결·난이도(1~3)를 한국어로 작성(근거는 abstract만) → `data/weekly/YYYY-Www.json` (형식은 PLAN 5절)
4. `.github/workflows/weekly.yml`: cron `0 22 * * 0`, 수동 실행 시 week 입력, concurrency 그룹 `data-commit`
5. 프론트: `src/lib/issues.ts`, 최신 호와 지난 호 목록, `/weeks/[week]` 상세. Next 16에 cacheComponents가 켜져 있으니 `node_modules/next/dist/docs/`를 먼저 읽고 fs 읽기에 `'use cache'` + `generateStaticParams`를 쓴다
6. (선택) vercel.json ignoreCommand로 daily 커밋마다 재빌드되는 것 방지
7. PLAN.md 갱신: 모델 결정, 점수 공식, 백필 방침, 튜닝 이력

## 튜닝 이력 메모 (7단계에서 PLAN에 기록)
2026-10-26 데이터로 세 번 실행했다.
- 같은 profile로 2회: 노이즈는 대체로 ±5점, 최대 20점
- profile 수정 후: 로봇·물리 에이전트 40점대 → 5~15점, RAG·메모리 +15~35점, 최고점 65 → 80, 코딩 에이전트는 하락
- 인사이트: 제목과 점수만으로는 사람이 판단하기 어렵다. 핵심 가치는 요약 품질이다.
- M3 과제: exclude 우선 규칙 명시, 노이즈 측정

## 환경 주의사항
- WSL(Ubuntu)에서 작업하고, VS Code는 "Reopen Folder in WSL"로 연다. Windows git으로 WSL 폴더를 다루면 "dubious ownership" 에러가 난다.
- 새 PC 준비물: Node(nvm), uv(`curl -LsSf https://astral.sh/uv/install.sh | sh`), `cd pipeline && uv sync`
- `astral-sh/setup-uv`는 `@v10` 같은 큰 버전 태그가 없다. 정확한 버전(`@v10.3.2`)으로 적어야 한다.
- Actions에서 "Re-run"은 실패 당시 커밋으로 다시 돈다. 수정을 반영하려면 "Run workflow"로 새로 실행한다.
- 봇이 매일 data/에 커밋하므로, 작업 전에 항상 `git pull` 한다.
