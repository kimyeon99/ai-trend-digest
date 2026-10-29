# ai-trend-digest 인수인계 (2026-10-29 기준)

새 세션에서 이 저장소를 이어서 작업할 때 읽는 문서다. 먼저 PLAN.md를 읽고, 아래 내용을 따른다.

## 작업 방식 (꼭 지킬 것)
- 항상 한국어로 답한다.
- 한 번에 한 단계(커밋 단위)씩만 진행한다. 코드를 쓰기 전에 "무엇을, 왜"를 쉬운 말로 설명하고 내 동의를 받는다. 구현한 뒤에는 내가 직접 확인할 방법을 알려 주고 멈춘다. 이전에 설명 없이 여러 단계를 몰아서 했다가 내가 이해하지 못한 적이 있다. 포트폴리오 프로젝트라서 내가 면접에서 설명할 수 있어야 한다.
- 용어는 처음 나올 때 한 줄로 풀어 쓴다.
- 파일을 수정한 답변 끝에는 추천 커밋 메시지를 붙인다. prefix(feat:/fix:/docs:/chore:)는 영어, 본문은 한국어로 쓴다. 예: `feat: 매일 논문을 수집하는 워크플로 추가`
- 이 기억들은 새 PC의 메모리에도 저장해 둔다.

## 현재 상태 (M1 Papers 트랙 구현 완료, 1호 발행 목표 11/9 월)
배포: https://ai-trend-digest-one.vercel.app (Vercel Hobby, main에 push하면 자동 배포)

완료 (모두 main에 push됨, 결정 이유는 PLAN 9절 변경 이력):
- `pipeline/` (Python 3.13, uv), pytest 20개
  - `collect.py`: HF Daily Papers API → `data/daily/YYYY-MM-DD.json`. 재실행하면 추천 수만 갱신
  - `score.py`: claude-haiku-5-5(effort low)로 점수 없는 항목만 채점. `messages.parse` 구조화 출력, id 검증
  - `publish_weekly.py`: 7일치 재수집·채점 → 중복 제거 → `0.7×관련도 + 0.3×추천 수(log 정규화)` Top 5 → claude-sonnet-5-5(effort high, `fallbacks="default"`)로 작성 → 응답 검증 → `data/weekly/YYYY-Www.json`
- Actions: `daily.yml`(수집+채점), `weekly.yml`(월 07:00 JST 발행), `score-preview.yml`(수동, 튜닝용). daily·weekly는 채점·작성이 실패해도 데이터는 커밋
- 프론트: `src/lib/issues.ts`(`'use cache'` + `cacheLife("max")`), `IssueView`, 홈(최신 호+지난 호), `/weeks/[week]`(`generateStaticParams`). 스타일은 최소한만 적용
- `vercel.json`: `data/daily`·`pipeline`·문서만 바뀐 커밋은 빌드 생략 (마지막 성공 배포와 비교)
- W43(10/19~10/25)을 수동 발행해 0호로 확인. 요약 숫자가 모두 abstract에 있는 것 확인
- GitHub Secrets에 `ANTHROPIC_API_KEY` 등록, 월 한도 설정. **로컬 PC와 Vercel에는 키를 두지 않는다**(내가 원하지 않음). LLM 실행 확인은 Actions(score-preview, weekly 수동 실행)로 한다.

## 다음 단계
1. daily cron 3일 연속 성공 확인 (M1 완료 기준). daily 커밋 뒤 Vercel 배포가 Canceled(빌드 생략)인지도 확인
2. UI/UX 디자인: 내가 지시할 때 진행한다. 한글 폰트 결정 포함(지금 Geist에는 한글이 없음)
3. 11/9(월) 1호(W45) 자동 발행 확인
4. M3 메모
   - 요약 한 줄이 100자를 넘는 경우가 많다. 1호를 읽어 보고 프롬프트 수정 여부 결정
   - exclude 우선 규칙을 채점 기준에 명시 (BrickWright가 exclude 대상인데 10→25점)
   - 1주치 데이터로 선정 비율(0.7/0.3, 0.5/0.5, 관련도 60 이상 중 추천순) 비교
5. 정리할 것: 기본 Next 페이지가 쓰던 `public/next.svg`, `public/vercel.svg`가 안 쓰임

## 튜닝 이력
`docs/tuning-log.md`에 기록한다. profile이나 채점 기준을 바꿀 때마다 같은 형식(조건, 바꾼 것, 결과 표, 관찰, 다음에 할 것)으로 추가하고, PLAN 9절 변경 이력에 링크를 남긴다.

## 환경 주의사항
- WSL(Ubuntu)에서 작업하고, VS Code는 "Reopen Folder in WSL"로 연다. Windows git으로 WSL 폴더를 다루면 "dubious ownership" 에러가 난다.
- 새 PC 준비물: Node(nvm), uv(`curl -LsSf https://astral.sh/uv/install.sh | sh`), `cd pipeline && uv sync`
- `astral-sh/setup-uv`는 `@v10` 같은 큰 버전 태그가 없다. 정확한 버전(`@v10.3.2`)으로 적어야 한다.
- Actions에서 "Re-run"은 실패 당시 커밋으로 다시 돈다. 수정을 반영하려면 "Run workflow"로 새로 실행한다.
- 봇이 매일 data/에 커밋하므로, 작업 전에 항상 `git pull` 한다.
- WSL에서 `npm`을 쓰려면 nvm이 로드된 셸이어야 한다. 그렇지 않으면 Windows의 npm이 잡혀 UNC 경로 에러가 난다.
- `npm run dev` 중에는 새 호 파일이 바로 반영되지 않는다(`cacheLife("max")`). 새 호를 pull 받으면 dev 서버를 재시작한다.
