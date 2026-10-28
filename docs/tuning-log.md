# 선별 튜닝 기록

profile.yaml이나 채점 기준을 바꿀 때마다 무엇을 왜 바꿨고 결과가 어땠는지 기록한다. 측정은 `score-preview` 워크플로로 한다.

---

## 2026-10-28 · profile 분야별 정리 + 물리 에이전트 제외

### 조건

- 데이터: `data/daily/2026-10-23.json` (49편)
- 모델: claude-haiku-5-5, effort low, 채점 기준(`score.py`의 `SYSTEM_PROMPT`)은 바꾸지 않음
- ① 이전 profile · ② 이전 profile 재실행 · ③ 새 profile
  - ②는 원래 새 profile을 시험하려던 실행이었다. push하기 전에 돌려서 같은 profile로 두 번 돌린 결과가 됐고, 덕분에 노이즈를 잴 수 있었다.

### 바꾼 것

```diff
 interests:
-  - 프론트엔드 개발에 쓰는 AI 도구 (코딩 에이전트, IDE 통합)
-  - LLM을 제품에 넣는 방법 (구조화 출력, 평가, 비용)
-  - 에이전트 설계
+  frontend:
+    - 프론트엔드 개발에 쓰는 AI 도구 (코딩 에이전트, IDE 통합)
+  backend:
+    - LLM을 제품에 넣는 방법 (구조화 출력, 평가, 비용)
+    - LLM 서빙·배포 (추론 서버, 지연 시간, 비용)
+    - RAG·검색 (벡터 DB, 임베딩)
+    - 데이터 파이프라인·배치 처리
+    - API 설계, 인증
+  ai_agent:
+    - LLM 에이전트 설계 (도구 호출, 메모리, 멀티 에이전트 구조)
 exclude:
   - 특정 산업(의료 등) 전용 응용
+  - 로봇·자율주행·3D 등 물리 세계에서 동작하는 에이전트
```

**이유:** ①에서 "에이전트"라는 단어만 있으면 로봇·3D·레고 에이전트에도 35~45점을 줬다. 의도는 LLM 소프트웨어 에이전트였다. 관심사를 분야별로 나누면서 backend 관심사도 추가했다.

### 결과

| 논문 | ① | ② | ③ | ③−② |
| --- | --: | --: | --: | --: |
| SCOPE: Compiling Natural-Language Policies | 65 | 68 | 80 | +12 |
| Is Complex Agentic Memory Always Needed? | 60 | 60 | 75 | +15 |
| Heartbeat Thinking | 55 | 55 | 70 | +15 |
| EvalResearchBench | 55 | 58 | 70 | +12 |
| RouteWeaver | 60 | 55 | 65 | +10 |
| IF-MAP | 50 | 60 | 65 | +5 |
| Deep Fusion Memory | 25 | 30 | 60 | **+30** |
| IQuest-Q1 (Agentic CLI 코딩) | 62 | 62 | 55 | **−7** |
| Diffusion Language Models Change Speed | 50 | 62 | 55 | −7 |
| Agent Mosaic | 40 | 40 | 50 | +10 |
| Bridging Exploration and Persona | 45 | 50 | 50 | 0 |
| Deep Search in Real-World Web Environments | 45 | 55 | 45 | −10 |
| Different Tasks, Different Timesteps | 40 | 40 | 45 | +5 |
| SplatLab (3DGS 연구 에이전트) | 45 | 45 | 45 | 0 |
| Meta Expert | 25 | 25 | 40 | +15 |
| Rethinking Sequence Compression | 22 | 15 | 40 | +25 |
| Inherited, Not Invented | 40 | 60 | 40 | −20 |
| RIDAR | 50 | 45 | 40 | −5 |
| Beyond Watching and Searching | 45 | 50 | 35 | −15 |
| MolLean | 40 | 38 | 35 | −3 |
| What Makes a Good Unmasking Policy? | 40 | 55 | 35 | −20 |
| Who Takes the Lead? | 40 | 40 | 35 | −5 |
| Code2Video-Compass | 55 | 45 | 30 | −15 |
| AgentVQA | 45 | 45 | 30 | −15 |
| The LLM-Attacker | 30 | 25 | 30 | +5 |
| SEAM | 8 | 5 | 25 | +20 |
| Realism VS Accuracy | 25 | 12 | 25 | +13 |
| Cola2 | 15 | 12 | 20 | +8 |
| WeVisOne-VL | 12 | 15 | 15 | 0 |
| Verus-Insight | 10 | 10 | 15 | +5 |
| AnyGameRenderer | 30 | 30 | 15 | −15 |
| MambaAct (로봇) | 8 | 8 | 15 | +7 |
| What Generation Knows | 15 | 14 | 12 | −2 |
| FilmFlow (3D 영화 에이전트) | 20 | 30 | 12 | **−18** |
| TARSphere (로봇 에이전트) | 40 | 42 | 12 | **−30** |
| Toward Recursive Self-Improvement in Physical AI | 10 | 12 | 10 | −2 |
| Policy-Mask | 8 | 10 | 10 | 0 |
| BrickWright (레고 에이전트) | 35 | 35 | 10 | **−25** |
| LaLa-World | 5 | 8 | 8 | 0 |
| TILDE | 5 | 8 | 8 | 0 |
| Skeleton-Grounded Latent Action Model | 5 | 6 | 8 | +2 |
| Making MLLM Latents Matter | 8 | 8 | 5 | −3 |
| Editing Images into Reusable Layers | 8 | 10 | 5 | −5 |
| Self-Distilling Future Video Representations | 5 | 8 | 5 | −3 |
| RLSplat | 5 | 5 | 5 | 0 |
| F2G-Pose | 5 | 5 | 5 | 0 |
| RTAformer | 5 | 5 | 5 | 0 |
| Foundation4D | 5 | 5 | 5 | 0 |
| HyperDrone | 5 | 5 | 5 | 0 |

**상위 5 (동점 포함)**

- ①: SCOPE, IQuest-Q1, Agentic Memory, RouteWeaver, (55점 동점) Code2Video·Heartbeat·EvalResearchBench
- ②: SCOPE, IQuest-Q1, Diffusion LM, (60점 동점) Agentic Memory·Inherited·IF-MAP
- ③: SCOPE, Agentic Memory, Heartbeat, EvalResearchBench, (65점 동점) RouteWeaver·IF-MAP

### 관찰

1. **노이즈 (① vs ②, 같은 profile):** 평균 3.5점, 49편 중 40편이 ±5점 안이었다. 최대 20점까지 흔들렸다(Inherited, Not Invented). 중간 점수대(40~60)에서 흔들림이 크다.
2. **노이즈만으로 상위 5가 바뀐다:** ①과 ②의 상위 5 중 공통은 3편(SCOPE, IQuest-Q1, Agentic Memory)뿐이다. 4~5위 자리는 55~60점에 동점이 몰려 있어서, 실행할 때마다 바뀐다.
3. **exclude 효과:** 로봇·물리 에이전트가 35~42점에서 10~12점으로 떨어졌다(TARSphere, BrickWright, FilmFlow). 이유에도 "exclude 대상"이라고 나온다. 노이즈보다 확실히 크다. SplatLab은 3D 분야지만 실제로는 코드를 돌리는 연구 에이전트라 그대로였는데, 납득할 만하다.
4. **backend 효과:** RAG·메모리 논문이 올랐다(Deep Fusion Memory +30, Agentic Memory +15). 최고점이 68에서 80으로 올라, interests에 직접 맞는 논문이 기준표대로 80점대에 들어왔다.
5. **부작용:** IQuest-Q1(코딩 CLI 에이전트)이 62에서 55로 내려가 상위 5에서 빠졌다. 원인은 두 가지로 본다. backend 항목이 5개라 항목 수가 가중치처럼 작동했고, "프론트엔드 개발에 쓰는"이라는 표현이 범위를 좁혔다.
6. **사람이 판단하기 어렵다:** 영어 제목과 점수만으로는 내가 맞는 순위인지 판단하기 어려웠다. 이 제품의 핵심 가치는 선별보다 요약 품질(3줄 요약, 실무 연결)일 수 있다.

### 다음에 할 것

- frontend 항목을 `AI 코딩 도구 (코딩 에이전트, CLI, IDE 통합)`로 넓힐지 결정 (5번)
- 주간 선정은 relevance만 쓰지 말고 upvotes와 섞는다(PLAN의 원칙). 4~5위가 흔들리는 문제(2번)를 줄이는지 확인
- M3: exclude 우선 규칙을 채점 기준에 명시, 같은 날짜 3회 실행으로 노이즈 재측정

---

## 2026-10-28 · frontend 관심사를 AI 코딩 도구 전반으로 넓힘

### 조건

- 데이터: `data/daily/2026-10-23.json` (49편)
- 모델: claude-haiku-5-5, effort low, 채점 기준(`score.py`의 `SYSTEM_PROMPT`)은 바꾸지 않음
- ③ 이전 profile (위 기록의 ③) · ④ 새 profile

### 바꾼 것

```diff
 interests:
   frontend:
-    - 프론트엔드 개발에 쓰는 AI 도구 (코딩 에이전트, IDE 통합)
+    - AI 코딩 도구 (코딩 에이전트, CLI, IDE 통합)
```

**이유:** 위 기록의 관찰 5번. IQuest-Q1(코딩 CLI 에이전트)이 62에서 55로 내려가 상위 5에서 빠졌다. "프론트엔드 개발에 쓰는"이라는 표현이 범위를 좁혔다고 봤다.

### 결과

| 논문 | ③ | ④ | ④−③ |
| --- | --: | --: | --: |
| Is Complex Agentic Memory Always Needed? | 75 | 78 | +3 |
| SCOPE: Compiling Natural-Language Policies | 80 | 72 | −8 |
| IQuest-Q1 (Agentic CLI 코딩) | 55 | 70 | **+15** |
| Deep Fusion Memory | 60 | 68 | +8 |
| RouteWeaver | 65 | 68 | +3 |
| Deep Search in Real-World Web Environments | 45 | 62 | +17 |
| Agent Mosaic | 50 | 62 | +12 |
| IF-MAP | 65 | 60 | −5 |
| EvalResearchBench | 70 | 55 | −15 |
| Diffusion Language Models Change Speed | 55 | 55 | 0 |
| RIDAR | 40 | 55 | +15 |
| Different Tasks, Different Timesteps | 45 | 50 | +5 |
| Code2Video-Compass | 30 | 45 | **+15** |
| MolLean | 35 | 45 | +10 |
| SplatLab (3DGS 연구 에이전트) | 45 | 45 | 0 |
| What Makes a Good Unmasking Policy? | 35 | 45 | +10 |
| Bridging Exploration and Persona | 50 | 45 | −5 |
| Meta Expert | 40 | 40 | 0 |
| Heartbeat Thinking | 70 | 40 | **−30** |
| Rethinking Sequence Compression | 40 | 40 | 0 |
| Who Takes the Lead? | 35 | 40 | +5 |
| Beyond Watching and Searching | 35 | 35 | 0 |
| Inherited, Not Invented | 40 | 35 | −5 |
| AgentVQA | 30 | 30 | 0 |
| AnyGameRenderer | 15 | 30 | **+15** |
| The LLM-Attacker | 30 | 30 | 0 |
| BrickWright (레고 에이전트) | 10 | 25 | **+15** |
| FilmFlow (3D 영화 에이전트) | 12 | 20 | +8 |
| WeVisOne-VL | 15 | 15 | 0 |
| MambaAct (로봇) | 15 | 15 | 0 |
| Realism VS Accuracy | 25 | 15 | −10 |
| TARSphere (로봇 에이전트) | 12 | 15 | +3 |
| Toward Recursive Self-Improvement in Physical AI | 10 | 12 | +2 |
| What Generation Knows | 12 | 12 | 0 |
| Cola2 | 20 | 12 | −8 |
| TILDE | 8 | 12 | +4 |
| Editing Images into Reusable Layers | 5 | 10 | +5 |
| LaLa-World | 8 | 10 | +2 |
| SEAM | 25 | 10 | −15 |
| Making MLLM Latents Matter | 5 | 8 | +3 |
| Self-Distilling Future Video Representations | 5 | 8 | +3 |
| Policy-Mask | 10 | 8 | −2 |
| Verus-Insight | 15 | 8 | −7 |
| Skeleton-Grounded Latent Action Model | 8 | 8 | 0 |
| RLSplat | 5 | 5 | 0 |
| F2G-Pose | 5 | 5 | 0 |
| RTAformer | 5 | 5 | 0 |
| Foundation4D | 5 | 5 | 0 |
| HyperDrone | 5 | 5 | 0 |

**상위 5**

- ③: SCOPE, Agentic Memory, Heartbeat, EvalResearchBench, (65점 동점) RouteWeaver·IF-MAP
- ④: Agentic Memory, SCOPE, IQuest-Q1, (68점 동점) Deep Fusion Memory·RouteWeaver. 6위(62점)와 6점 차이가 난다.

### 관찰

1. **의도한 효과:** IQuest-Q1이 55에서 70으로 올라 3위가 됐다. 이유에도 "AI 코딩 도구 관심 항목과 직접 맞닿아 있다"고 나온다. 노이즈(평균 3.5점)보다 확실히 크다.
2. **부작용 — 코딩 주변 주제가 같이 올랐다:** Code2Video(+15), AnyGameRenderer(+15), BrickWright(+15). 이유에 모두 "코딩 에이전트와 일부 관련"이 나온다. BrickWright는 exclude 대상(물리 조립)인데도 10에서 25로 올랐다. "코딩"에 맞는 신호가 exclude를 일부 이겼다. 아직 낮은 점수라 상위 선정에는 영향이 없다.
3. **profile과 무관한 변동이 컸다:** Heartbeat Thinking이 70에서 40으로 떨어졌다(−30). 이번 변경과 관계없는 논문인데, 위 기록에서 잰 최대 노이즈(20점)보다 크다. 이유도 ③에서는 도구 호출 설계를 높게 봤고, ④에서는 "음성 중심"이라고 깎았다. EvalResearchBench(−15)도 비슷하다. 전체로 보면 평균 5.9점이 움직였고, 49편 중 31편이 ±5점 안이었다.
4. **상위권은 안정적이다:** SCOPE, Agentic Memory, RouteWeaver는 ③과 ④ 모두 상위 5에 있다. 흔들리는 것은 4~5위 자리다(위 기록 관찰 2번과 같다).

### 결론

변경을 유지한다. 의도한 효과(IQuest-Q1 복귀)가 노이즈보다 크다. 부작용(2번)은 상위 선정에 영향이 없다.

### 다음에 할 것

- 3번 때문에 한 번 실행한 결과로는 개별 논문 점수를 믿기 어렵다. 주간 선정에서 upvotes와 섞는 것(PLAN의 원칙)이 더 중요해졌다.
- M3: exclude 우선 규칙을 채점 기준에 명시(2번의 BrickWright), 같은 날짜 3회 실행으로 노이즈 재측정
