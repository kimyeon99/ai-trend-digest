# ai-trend-digest 인수인계 (2026-11-10 기준)

새 세션에서 이 저장소를 이어서 작업할 때 읽는 문서다. 먼저 PLAN.md를 읽고, 아래 내용을 따른다.

## 작업 방식 (꼭 지킬 것)
- 항상 한국어로 답한다.
- 한 번에 한 단계(커밋 단위)씩만 진행한다. 코드를 쓰기 전에 "무엇을, 왜"를 쉬운 말로 설명하고 내 동의를 받는다. 구현한 뒤에는 내가 직접 확인할 방법을 알려 주고 멈춘다. 이전에 설명 없이 여러 단계를 몰아서 했다가 내가 이해하지 못한 적이 있다. 포트폴리오 프로젝트라서 내가 면접에서 설명할 수 있어야 한다.
- 용어는 처음 나올 때 한 줄로 풀어 쓴다.
- 파일을 수정한 답변 끝에는 추천 커밋 메시지를 붙인다. prefix(feat:/fix:/docs:/chore:)는 영어, 본문은 한국어로 쓴다. 예: `feat: 매일 논문을 수집하는 워크플로 추가`
- 커밋과 push는 내가 직접 한다.
- 이 기억들은 새 환경의 메모리에도 저장해 둔다.

## 현재 상태
배포: https://ai-trend-digest-one.vercel.app (Vercel Hobby, main에 push하면 자동 배포)

**M1 Papers 트랙 완료.** daily는 10/29부터 매일 성공, weekly가 W44(11/2)·W45(11/9)를 자동 발행했다.

### 파이프라인 (`pipeline/`, pytest 23개)
- `collect.py` → `score.py`(Haiku 5.5, 관련도 0~100 + 한국어 채점 이유) → `publish_weekly.py`(Sonnet 5.5)
- 선정: `0.7×관련도 + 0.3×추천 수(주간 log 정규화)` Top 5
- 주간 JSON의 논문 필드: `oneliner`(쉬운 한 줄 설명), `summary`(문제/방법/결과 3문장), `practical`, `difficulty`, `label`, `terms`(용어 풀이 최대 4개), `abstract`(초록 원문 그대로), `selection`(final·relevance·upvotes·reason)
- `label`은 고정 8개 중 하나(Pydantic `Literal`): 코딩 도구 / 메모리·컨텍스트 / RAG·검색 / 서빙·효율 / 평가·벤치마크 / 멀티 에이전트 / LLM 제품화 / 학습·추론 방법. 나중에 라벨 필터에 쓴다
- `headline`은 문장이 아니라 주제 명사구 2~4개를 ` · `로 이은 것 (문장형은 "AI 티가 난다"는 피드백으로 바꿈)
- W43·W44는 위 필드를 채우려고 weekly를 재실행했다. **재실행하면 추천 수를 다시 받아 게재 논문이 바뀔 수 있다**(실제로 각 1편씩 바뀜). `selection`은 LLM 없이 daily 데이터로 W43~W45에 채워 넣었다
- 환각 점검: 요약 속 숫자를 초록에서 대조. 지금까지 전부 원문에 있었다(eight → 8 같은 경우 포함)

### 프론트 (Next.js 16, `cacheComponents`)
- 폰트 Noto Sans KR, 색 토큰(`globals.css`): 오프화이트 배경 + 보라 포인트(#7c3aed / 다크 #a78bfa), 다크 모드는 OS 설정 + 토글 버튼(깜빡임 방지 인라인 스크립트)
- 홈: 키워드 헤드라인 → "이번 주 추천 논문" 벤토(1위 크게 + HF 썸네일, 2·3위 작게) → "더 볼 논문"(4·5위)
- 카드: 라벨 · 순위 · 난이도 · 관련도 · 추천 / 한 줄 설명(크게) / 영문 제목(작게). 카드 전체가 링크
- **주소가 있는 모달**: 카드 클릭 시 `/weeks/[week]/[arxivId]` 주소로 모달이 뜬다(`src/app/@modal`, intercepting + parallel routes). 뒤로가기로 닫히고, 새로고침·공유 링크는 일반 페이지(`src/app/weeks/[week]/[paper]`)로 열린다
- 모달 내용(`PaperDetail`): 한 줄 설명 → 썸네일 → 어떤 문제인가 / 어떻게 풀었나 / 결과 → 왜 중요한가 → 왜 골랐나(채점 이유 + 점수 계산식) → 용어 풀이 → 초록 원문(접기) → 원문 보기
- 하지 않기로 한 것: 아코디언 갤러리, hover 빛 효과, 검색·필터(편수가 적음), 구독(서버 필요), Pill Nav

## 다음 단계
1. **"2번": 홈 한 줄 소개 + "만든 방법" 페이지.** 처음 온 사람이 무슨 사이트인지 바로 알게 하고, 숨어 있는 가치(자동 수집·채점, 선정 공식, 환각 점검, 튜닝 기록)를 보여 준다. Tools 트랙은 "준비 중"으로 적는다. ui-ux-pro-max 스킬을 써 볼 예정
2. **11/15 지원**: 포트폴리오에 "진행 중 + 링크"로 넣는다
3. **M2 Tools 트랙 (11/14~)**, 정의를 넓혔다
   - 릴리스 소식 + **AI 에이전트 활용법, 검증법, skills 같은 실무 노하우**
   - 항목: 판정(지금 써 보기 / 지켜보기 / 무시해도 됨) + 한 줄 요약 + 이유 + "바로 해볼 것" 한 줄
   - 소스(내가 고름): 토스 기술 블로그 https://toss.tech/ , 배민 기술 블로그 https://techblog.woowahan.com/ , velog(velog.io)
   - 확인할 것: 각 소스의 RSS 유무. velog는 사이트 전체 RSS가 없고 사용자별 피드만 있는 것으로 보임. 일반 기술 블로그라 "AI 개발 활용 글인가"를 LLM으로 거르는 단계가 필요
   - 배경: 나는 W45를 읽지 않았다. 논문만으로는 실용 가치가 부족하고, 실무 가치는 원래 Tools 트랙 몫이었다
4. 프롬프트 다듬기 + `docs/tuning-log.md` 기록(라벨·키워드 헤드라인·한 줄 설명 추가는 아직 기록 안 함)
   - 한 줄 설명 말투가 호마다 섞임("~논문입니다." / "~제안한다.")
   - 한 줄 설명에 전문용어가 남아 있음(KV 캐시, 하네스 등)
   - 헤드라인 주제마다 "에이전트"가 반복됨, "하니스/하네스" 표기 흔들림
5. 라벨 필터 (지난 호가 더 쌓인 뒤)
6. M3 메모
   - exclude 우선 규칙을 채점 기준에 명시 (BrickWright가 exclude 대상인데 10→25점)
   - 1주치 데이터로 선정 비율(0.7/0.3, 0.5/0.5, 관련도 60 이상 중 추천순) 비교
7. 정리할 것: `public/next.svg`, `public/vercel.svg`가 안 쓰임

## 튜닝 이력
`docs/tuning-log.md`에 기록한다. profile이나 채점·작성 기준을 바꿀 때마다 같은 형식(조건, 바꾼 것, 결과 표, 관찰, 다음에 할 것)으로 추가하고, PLAN 9절 변경 이력에 링크를 남긴다.

## 환경 주의사항
- WSL(Ubuntu)에서 작업하고, VS Code는 "Reopen Folder in WSL"로 연다. Windows 쪽에서 열면 git "dubious ownership", nvm, Python 문제가 생긴다.
- `/plugin` 같은 플러그인 명령은 VS Code 확장(채팅창)에서 안 된다. WSL 터미널에서 `claude` CLI를 켜고 실행한다.
- 새 PC 준비물: Node(nvm), uv(`curl -LsSf https://astral.sh/uv/install.sh | sh`), `cd pipeline && uv sync`
- 로컬 `main`에 upstream이 설정돼 있지 않다. `git pull origin main`으로 받거나 `git branch --set-upstream-to=origin/main main`을 한 번 해 둔다.
- 봇이 매일 data/에 커밋하므로, 작업 전에 항상 pull 한다.
- GitHub Secrets에 `ANTHROPIC_API_KEY`. **로컬 PC와 Vercel에는 키를 두지 않는다**(내가 원하지 않음). LLM 실행 확인은 Actions(score-preview, weekly 수동 실행)로 한다.
- `astral-sh/setup-uv`는 정확한 버전(`@v10.3.2`)으로 적어야 한다. Actions의 "Re-run"은 실패 당시 커밋으로 돈다. 수정을 반영하려면 "Run workflow"로 새로 실행한다.
- `npm run dev` 중에는 새 호 파일이 바로 반영되지 않는다(`cacheLife("max")`). 새 호를 pull 받으면 dev 서버를 재시작한다.
- `cacheComponents`에서는 떠난 화면을 지우지 않고 숨겨 둔다(React Activity). 모달 `<dialog>`는 effect 정리 함수에서 직접 닫아야 뒤로가기 후에도 안 남는다(`Modal.tsx`).
- 없는 주소의 `notFound()`는 로컬에서 200(noindex)을 돌려주지만 Vercel에서는 404가 나온다.
- 테스트 서버는 3100 포트로 띄운다(내 dev 서버는 3000). 종료는 `fuser -k 3100/tcp`로 하고, `pkill -f`는 쓰지 않는다.
